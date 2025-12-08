$ErrorActionPreference = 'Stop'
$base = 'http://localhost:5000'
function ensure-login($email,$password,$role,$name){
    try{
        $body = @{email=$email; password=$password} | ConvertTo-Json
        $res = Invoke-RestMethod -Uri "$base/api/auth/login" -Method Post -Body $body -ContentType 'application/json' -UseBasicParsing
        return $res
    } catch {
        Write-Output "Login failed for $email, attempting register"
        try{
            $reg = @{name=$name; email=$email; password=$password; role=$role} | ConvertTo-Json
            Invoke-RestMethod -Uri "$base/api/auth/register" -Method Post -Body $reg -ContentType 'application/json' -UseBasicParsing | Out-Null
            $body2 = @{email=$email; password=$password} | ConvertTo-Json
            $res2 = Invoke-RestMethod -Uri "$base/api/auth/login" -Method Post -Body $body2 -ContentType 'application/json' -UseBasicParsing
            return $res2
        } catch {
            Write-Output ('Register/login failed for {0}: {1}' -f $email, $_)
            return $null
        }
    }
}

$drv = ensure-login 'dev_driver_ci@example.com' 'Password123!' 'driver' 'CI Driver'
if ($drv -eq $null) { Write-Output 'Driver auth failed'; exit 1 }
$drvToken = $drv.token

$share = @{origin='AutoCity'; destination='AutoTown'; date='2025-12-20'; time='09:00'; price=150; seats=4; availableSeats=4} | ConvertTo-Json
try {
    $postShare = Invoke-RestMethod -Uri "$base/api/driver/posts/share" -Method Post -Body $share -ContentType 'application/json' -Headers @{Authorization="Bearer $drvToken"} -UseBasicParsing
    Write-Output "Created share post id: $($postShare.id)"
} catch {
    Write-Output ('Create share failed: {0}' -f $_)
}

$hire = @{title='Loader'; category='Truck'; location='AutoCity'; rate='per day'; rateAmount=5000; description='Loader truck available'; status='available'} | ConvertTo-Json
try {
    $postHire = Invoke-RestMethod -Uri "$base/api/driver/posts/hire" -Method Post -Body $hire -ContentType 'application/json' -Headers @{Authorization="Bearer $drvToken"} -UseBasicParsing
    Write-Output "Created hire post id: $($postHire.id)"
} catch {
    Write-Output ('Create hire failed: {0}' -f $_)
}

$rdr = ensure-login 'dev_rider_ci@example.com' 'Password123!' 'rider' 'CI Rider'
if ($rdr -eq $null) { Write-Output 'Rider auth failed'; exit 1 }
$rdrToken = $rdr.token

Write-Output "Calling /api/rider/marketplace/share"
try {
    $mpShare = Invoke-RestMethod -Uri "$base/api/rider/marketplace/share" -Method Get -Headers @{Authorization="Bearer $rdrToken"} -UseBasicParsing
    $mpShare | ConvertTo-Json -Compress | Write-Output
} catch {
    Write-Output ('marketplace/share failed: {0}' -f $_)
}

Write-Output "Calling /api/rider/marketplace/hire"
try {
    $mpHire = Invoke-RestMethod -Uri "$base/api/rider/marketplace/hire" -Method Get -Headers @{Authorization="Bearer $rdrToken"} -UseBasicParsing
    $mpHire | ConvertTo-Json -Compress | Write-Output
} catch {
    Write-Output ('marketplace/hire failed: {0}' -f $_)
}

Write-Output "Calling /api/rider/rideshare/search?pickupLocation=AutoCity"
try {
    $search = Invoke-RestMethod -Uri "$base/api/rider/rideshare/search?pickupLocation=AutoCity&page=1&limit=10" -Method Get -Headers @{Authorization="Bearer $rdrToken"} -UseBasicParsing
    $search | ConvertTo-Json -Compress | Write-Output
} catch {
    Write-Output ('search failed: {0}' -f $_)
}
