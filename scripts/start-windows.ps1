$ErrorActionPreference = 'Stop'

try {
    $projectDirectory = Split-Path -Parent $PSScriptRoot
    Set-Location -LiteralPath $projectDirectory

    # Explorer does not inherit the Node.js PATH supplied by an editor.
    $nodeCandidates = @()
    $systemNode = Get-Command node.exe -CommandType Application -ErrorAction SilentlyContinue
    if ($systemNode) { $nodeCandidates += $systemNode.Source }
    $nodeCandidates += Join-Path $env:ProgramFiles 'nodejs\node.exe'
    $nodeCandidates += Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'

    $nodeExecutable = $null
    foreach ($candidate in ($nodeCandidates | Select-Object -Unique)) {
        if (-not (Test-Path -LiteralPath $candidate -PathType Leaf)) { continue }
        $versionText = & $candidate --version 2>$null
        if ($LASTEXITCODE -eq 0 -and $versionText -match '^v(\d+)\.' -and [int]$Matches[1] -ge 20) {
            $nodeExecutable = $candidate
            break
        }
    }

    if (-not $nodeExecutable) {
        throw 'Nu am gasit Node.js 20 sau mai nou. Instaleaza Node.js, apoi redeschide Start-PassionBox.cmd.'
    }

    $env:PASSIONBOX_OPEN_BROWSER = '1'
    Write-Host 'Pornire PassionBox...' -ForegroundColor Magenta
    & $nodeExecutable (Join-Path $PSScriptRoot 'serve.mjs')
    exit $LASTEXITCODE
} catch {
    Write-Host "PassionBox nu a putut porni: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
