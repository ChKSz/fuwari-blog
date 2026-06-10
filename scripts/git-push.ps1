param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$MessageParts
)

$ErrorActionPreference = "Stop"

$MessageParts = $MessageParts | Where-Object { $_ -ne "--" }

function Run-Git {
    param([string[]]$GitArgs)

    & git @GitArgs
    if ($LASTEXITCODE -ne 0) {
        throw "git $($GitArgs -join ' ') failed with exit code $LASTEXITCODE"
    }
    return $LASTEXITCODE
}

$scriptDir = Split-Path -Parent $PSCommandPath
$repoRoot = Resolve-Path (Join-Path $scriptDir "..")
Set-Location $repoRoot

Run-Git @("rev-parse", "--is-inside-work-tree") | Out-Null

$branch = git branch --show-current
if ([string]::IsNullOrWhiteSpace($branch)) {
    throw "Cannot push because the repository is not on a branch."
}

$message = ($MessageParts -join " ").Trim()
if ([string]::IsNullOrWhiteSpace($message)) {
    $message = "Update site $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
}

$changes = git status --porcelain
if ($changes) {
    Run-Git @("add", "-A")
    Run-Git @("commit", "-m", $message)
} else {
    Write-Host "No local changes to commit."
}

Run-Git @("push", "origin", $branch)
Write-Host "Pushed to origin/$branch"
