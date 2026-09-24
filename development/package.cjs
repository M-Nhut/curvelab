const path=require('node:path'),{spawnSync}=require('node:child_process');
const script=String.raw`
$ErrorActionPreference = 'Stop'
$projectRoot = $env:CURVELAB_PACKAGE_ROOT
$sitePath = (Resolve-Path -LiteralPath (Join-Path $projectRoot 'CurveLab')).Path
$archivePath = Join-Path $projectRoot 'CurveLab-deploy.zip'
if (-not $sitePath.StartsWith($projectRoot + [IO.Path]::DirectorySeparatorChar)) { throw 'Website outside project directory.' }
if (-not (Test-Path -LiteralPath (Join-Path $sitePath 'index.html'))) { throw 'Missing index.html.' }
$files = Get-ChildItem -LiteralPath $sitePath
if ($files | Where-Object { $_.Name -like '*.test.*' -or $_.Name -eq 'README.md' }) { throw 'Development files found in website.' }
Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.IO.Compression
$stream = [IO.File]::Open($archivePath, [IO.FileMode]::Create)
try {
 $zip = New-Object IO.Compression.ZipArchive($stream, [IO.Compression.ZipArchiveMode]::Create)
 try {
  Get-ChildItem -LiteralPath $sitePath -Recurse -File | ForEach-Object {
   $relative = $_.FullName.Substring($sitePath.Length + 1).Replace('\', '/')
   [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $_.FullName, $relative, [IO.Compression.CompressionLevel]::Optimal) | Out-Null
  }
 } finally { $zip.Dispose() }
} finally { $stream.Dispose() }
Write-Output "Ready to upload: $archivePath"
`;
const result=spawnSync('powershell',['-NoProfile','-Command',script],{env:{...process.env,CURVELAB_PACKAGE_ROOT:path.resolve(__dirname,'..')},stdio:'inherit',windowsHide:true});
if(result.error)throw result.error;process.exit(result.status||0);
