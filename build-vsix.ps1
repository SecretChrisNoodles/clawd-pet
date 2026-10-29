# Empaqueta la extension en un .vsix sin necesitar Node ni vsce.
# Uso:  powershell -ExecutionPolicy Bypass -File build-vsix.ps1
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem

$root = $PSScriptRoot
$pkg = Get-Content (Join-Path $root 'package.json') -Raw | ConvertFrom-Json
$out = Join-Path $root "$($pkg.name)-$($pkg.version).vsix"
$stage = Join-Path ([IO.Path]::GetTempPath()) "vsix-$([guid]::NewGuid())"

New-Item -ItemType Directory -Force (Join-Path $stage 'extension\media') | Out-Null
foreach ($f in 'package.json', 'extension.js', 'README.md') {
  Copy-Item -LiteralPath (Join-Path $root $f) -Destination (Join-Path $stage 'extension')
}
Copy-Item (Join-Path $root 'media\*') -Destination (Join-Path $stage 'extension\media')

$manifest = @"
<?xml version="1.0" encoding="utf-8"?>
<PackageManifest Version="2.0.0" xmlns="http://schemas.microsoft.com/developer/vsx-schema/2011" xmlns:d="http://schemas.microsoft.com/developer/vsx-schema-design/2011">
  <Metadata>
    <Identity Language="en-US" Id="$($pkg.name)" Version="$($pkg.version)" Publisher="$($pkg.publisher)" />
    <DisplayName>$($pkg.displayName)</DisplayName>
    <Description xml:space="preserve">$($pkg.description)</Description>
    <Categories>Other</Categories>
    <Properties>
      <Property Id="Microsoft.VisualStudio.Code.Engine" Value="$($pkg.engines.vscode)" />
    </Properties>
  </Metadata>
  <Installation>
    <InstallationTarget Id="Microsoft.VisualStudio.Code" />
  </Installation>
  <Dependencies />
  <Assets>
    <Asset Type="Microsoft.VisualStudio.Code.Manifest" Path="extension/package.json" Addressable="true" />
    <Asset Type="Microsoft.VisualStudio.Services.Content.Details" Path="extension/README.md" Addressable="true" />
  </Assets>
</PackageManifest>
"@
$types = @"
<?xml version="1.0" encoding="utf-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension=".json" ContentType="application/json" />
  <Default Extension=".js" ContentType="application/javascript" />
  <Default Extension=".css" ContentType="text/css" />
  <Default Extension=".md" ContentType="text/markdown" />
  <Default Extension=".vsixmanifest" ContentType="text/xml" />
  <Default Extension=".xml" ContentType="text/xml" />
</Types>
"@
$utf8 = New-Object System.Text.UTF8Encoding($false)
[IO.File]::WriteAllText((Join-Path $stage 'extension.vsixmanifest'), $manifest, $utf8)
[IO.File]::WriteAllText((Join-Path $stage '[Content_Types].xml'), $types, $utf8)

if (Test-Path -LiteralPath $out) { Remove-Item -LiteralPath $out }
# CreateFromDirectory en PowerShell 5.1 guarda rutas con '\', que VS Code rechaza; se usan '/'.
$zip = [IO.Compression.ZipFile]::Open($out, 'Create')
try {
  Get-ChildItem -LiteralPath $stage -Recurse -File | ForEach-Object {
    $name = $_.FullName.Substring($stage.Length + 1).Replace('\', '/')
    [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $_.FullName, $name) | Out-Null
  }
} finally { $zip.Dispose() }
Remove-Item -LiteralPath $stage -Recurse -Force
Write-Host "Creado: $out"
