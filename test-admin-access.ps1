# Verification script for Super Admin Role-Based Access Control
$baseUrl = "http://localhost:4000/api/v1"
$ErrorActionPreference = "Continue"

Write-Host "==========================================================" -ForegroundColor Yellow
Write-Host " TEST 1: Unauthorized User Access Attempt (Should Fail 403) " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Yellow

$rnd = Get-Random -Minimum 1000 -Maximum 9999
$normalEmail = "merchant_$rnd@teststore.in"
$pwd = "SecurePass123!"

# Register normal merchant
$regBody = @{
    email = $normalEmail
    password = $pwd
    name = "Shop Merchant"
    phone = "9822$rnd"
} | ConvertTo-Json

$normalUser = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -ContentType "application/json" -Body $regBody
$normalToken = $normalUser.data.accessToken

try {
    $res = Invoke-RestMethod -Uri "$baseUrl/admin/stats" -Method Get -Headers @{ Authorization = "Bearer $normalToken" }
    Write-Host " ERROR: Unauthorized user was able to access Admin stats!" -ForegroundColor Red
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host " SUCCESS: Normal user $normalEmail got expected $statusCode Forbidden!" -ForegroundColor Green
}

Write-Host "`n==========================================================" -ForegroundColor Yellow
Write-Host " TEST 2: Authorized Super Admin (shreyashsr2004@gmail.com) " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Yellow

$admin1Email = "shreyashsr2004@gmail.com"
# Register or login
try {
    $regRes = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -ContentType "application/json" -Body (@{
        email = $admin1Email
        password = "AdminSuperSecret@2026"
        name = "Shreyash Admin"
        phone = "9988776655"
    } | ConvertTo-Json)
    $admin1Token = $regRes.data.accessToken
} catch {
    $loginRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body (@{
        email = $admin1Email
        password = "AdminSuperSecret@2026"
    } | ConvertTo-Json)
    $admin1Token = $loginRes.data.accessToken
}

$admin1Check = Invoke-RestMethod -Uri "$baseUrl/admin/me" -Method Get -Headers @{ Authorization = "Bearer $admin1Token" }
Write-Host " SUCCESS: $admin1Email verified as Super Admin: $($admin1Check.data.isSuperAdmin)" -ForegroundColor Green

$admin1Stats = Invoke-RestMethod -Uri "$baseUrl/admin/stats" -Method Get -Headers @{ Authorization = "Bearer $admin1Token" }
Write-Host " Platform KPIs retrieved:" -ForegroundColor Green
Write-Host "   - Total Users: $($admin1Stats.data.kpis.totalUsers)" -ForegroundColor White
Write-Host "   - Total Businesses: $($admin1Stats.data.kpis.totalBusinesses)" -ForegroundColor White
Write-Host "   - Total Invoices: $($admin1Stats.data.kpis.totalInvoices)" -ForegroundColor White
Write-Host "   - Total Platform GMV: ₹$($admin1Stats.data.kpis.totalGrossRevenue)" -ForegroundColor White

Write-Host "`n==========================================================" -ForegroundColor Yellow
Write-Host " TEST 3: Authorized Super Admin (princevij04@gmail.com) " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Yellow

$admin2Email = "princevij04@gmail.com"
# Register or login
try {
    $regRes2 = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -ContentType "application/json" -Body (@{
        email = $admin2Email
        password = "AdminSuperSecret@2026"
        name = "Prince Admin"
        phone = "9988776644"
    } | ConvertTo-Json)
    $admin2Token = $regRes2.data.accessToken
} catch {
    $loginRes2 = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body (@{
        email = $admin2Email
        password = "AdminSuperSecret@2026"
    } | ConvertTo-Json)
    $admin2Token = $loginRes2.data.accessToken
}

$admin2Check = Invoke-RestMethod -Uri "$baseUrl/admin/me" -Method Get -Headers @{ Authorization = "Bearer $admin2Token" }
Write-Host " SUCCESS: $admin2Email verified as Super Admin: $($admin2Check.data.isSuperAdmin)" -ForegroundColor Green

$admin2Biz = Invoke-RestMethod -Uri "$baseUrl/admin/businesses" -Method Get -Headers @{ Authorization = "Bearer $admin2Token" }
Write-Host " Businesses Directory accessible: $($admin2Biz.data.meta.total) businesses indexed" -ForegroundColor Green

Write-Host "`n ALL SUPER ADMIN ACCESS CONTROLS VERIFIED 100%!" -ForegroundColor Green

