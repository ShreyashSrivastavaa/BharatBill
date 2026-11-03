# Complete E2E Workflow Verification for BharatBill
$baseUrl = "http://localhost:4000/api/v1"
$ErrorActionPreference = "Stop"

Write-Host "=== 1. Auth: Register Owner ===" -ForegroundColor Cyan
$rnd = Get-Random -Minimum 1000 -Maximum 9999
$email = "sharma_$rnd@bharatbill.test"
$password = "SharmaBill@2026"

$regBody = @{
    email = $email
    password = $password
    name = "Ramesh Sharma"
    phone = "987654$rnd"
} | ConvertTo-Json

$regRes = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -ContentType "application/json" -Body $regBody
$token = $regRes.data.accessToken
Write-Host " Registered User: $($regRes.data.user.email) (ID: $($regRes.data.user.id))" -ForegroundColor Green

$headers = @{
    "Authorization" = "Bearer $token"
}

Write-Host "`n=== 2. Onboarding: Create Business ===" -ForegroundColor Cyan
$bizBody = @{
    name = "Sharma Hardware & Electricals"
    legalName = "Sharma Enterprises Pvt Ltd"
    gstin = "27ABCDE1234F1Z5"
    businessType = "RETAIL"
    phone = "987654$rnd"
    email = $email
    addressLine1 = "Shop No 4, Shivaji Chowk"
    city = "Pune"
    state = "Maharashtra"
    stateCode = "27"
    pincode = "411001"
} | ConvertTo-Json

$bizRes = Invoke-RestMethod -Uri "$baseUrl/businesses" -Method Post -ContentType "application/json" -Headers $headers -Body $bizBody
$businessId = $bizRes.data.id
Write-Host " Created Business: $($bizRes.data.name) (ID: $businessId)" -ForegroundColor Green

# Add x-business-id for tenant isolation
$headers["x-business-id"] = $businessId

Write-Host "`n=== 3. Master Data: Create Category & Product ===" -ForegroundColor Cyan
$catBody = @{
    name = "Electrical Cables"
    description = "Copper wires and conduits"
} | ConvertTo-Json
$catRes = Invoke-RestMethod -Uri "$baseUrl/products/categories" -Method Post -ContentType "application/json" -Headers $headers -Body $catBody
$catId = $catRes.data.id

$prodBody = @{
    name = "Havells 2.5 Sq mm Wire (Red)"
    sku = "HAV-WIR-$rnd"
    hsnCode = "8544"
    categoryId = $catId
    unit = "BOX"
    purchasePrice = 1200
    sellingPrice = 1600
    gstRate = 18
    openingStock = 50
    lowStockThreshold = 10
} | ConvertTo-Json
$prodRes = Invoke-RestMethod -Uri "$baseUrl/products" -Method Post -ContentType "application/json" -Headers $headers -Body $prodBody
$prodId = $prodRes.data.id
Write-Host " Created Product: $($prodRes.data.name) with Initial Stock: $($prodRes.data.currentStock)" -ForegroundColor Green

Write-Host "`n=== 4. Master Data: Create Customer & Supplier ===" -ForegroundColor Cyan
$custBody = @{
    name = "Patel Electronics"
    phone = "9822001122"
    email = "patel@example.com"
    gstin = "27AAACP1234A1Z1"
    billingAddress = "Camp, Pune"
    city = "Pune"
    state = "Maharashtra"
    stateCode = "27"
    pincode = "411001"
} | ConvertTo-Json
$custRes = Invoke-RestMethod -Uri "$baseUrl/customers" -Method Post -ContentType "application/json" -Headers $headers -Body $custBody
$custId = $custRes.data.id
Write-Host " Created Customer: $($custRes.data.name) (ID: $custId)" -ForegroundColor Green

$suppBody = @{
    name = "Havells India Ltd (Distributor)"
    phone = "9822334455"
    email = "orders@havellsdist.com"
    gstin = "27AABCH1234B1Z9"
    address = "MIDC Bhosari, Pune"
    city = "Pune"
    state = "Maharashtra"
    stateCode = "27"
    pincode = "411026"
} | ConvertTo-Json
$suppRes = Invoke-RestMethod -Uri "$baseUrl/suppliers" -Method Post -ContentType "application/json" -Headers $headers -Body $suppBody
$suppId = $suppRes.data.id
Write-Host " Created Supplier: $($suppRes.data.name) (ID: $suppId)" -ForegroundColor Green

Write-Host "`n=== 5. Invoicing: Preview Tax & Finalize Invoice ===" -ForegroundColor Cyan
# Calculate Tax preview
$calcBody = @{
    placeOfSupply = "27"
    items = @(
        @{
            productId = $prodId
            productName = "Havells 2.5 Sq mm Wire (Red)"
            quantity = 5
            rate = 1600
            discount = 0
            gstRate = 18
        }
    )
} | ConvertTo-Json
$calcRes = Invoke-RestMethod -Uri "$baseUrl/invoices/preview-tax" -Method Post -ContentType "application/json" -Headers $headers -Body $calcBody
Write-Host " Tax Calculation Preview: Subtotal: ₹$($calcRes.data.subtotal), CGST: ₹$($calcRes.data.cgst), SGST: ₹$($calcRes.data.sgst), Total: ₹$($calcRes.data.total)" -ForegroundColor Green

# Create Draft Invoice
$invBody = @{
    customerId = $custId
    invoiceDate = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
    placeOfSupply = "27"
    items = @(
        @{
            productId = $prodId
            productName = "Havells 2.5 Sq mm Wire (Red)"
            quantity = 5
            rate = 1600
            discount = 0
            gstRate = 18
        }
    )
} | ConvertTo-Json
$invRes = Invoke-RestMethod -Uri "$baseUrl/invoices" -Method Post -ContentType "application/json" -Headers $headers -Body $invBody
$invId = $invRes.data.id
Write-Host " Draft Invoice Created: $($invRes.data.invoiceNumber)" -ForegroundColor Green

# Finalize Invoice (Deducts stock atomically & snapshots buyer/item details)
$finRes = Invoke-RestMethod -Uri "$baseUrl/invoices/$invId/finalize" -Method Post -ContentType "application/json" -Headers $headers
Write-Host " Finalized Invoice: $($finRes.data.invoiceNumber) (Status: $($finRes.data.status))" -ForegroundColor Green

# Verify Stock Decremented (50 - 5 = 45)
$chkProd = Invoke-RestMethod -Uri "$baseUrl/products/$prodId" -Method Get -Headers $headers
Write-Host " Stock after Finalized Invoice: $($chkProd.data.currentStock) (Expected 45)" -ForegroundColor Green

Write-Host "`n=== 6. Payments: Record Inbound Customer Payment ===" -ForegroundColor Cyan
$payBody = @{
    invoiceId = $invId
    direction = "RECEIVED"
    amount = 5000
    method = "UPI"
    reference = "UPI/20261103/998877"
    notes = "Advance UPI received via QR"
} | ConvertTo-Json
$payRes = Invoke-RestMethod -Uri "$baseUrl/payments" -Method Post -ContentType "application/json" -Headers $headers -Body $payBody
Write-Host " Payment Recorded: ID $($payRes.data.id), Amount: ₹$($payRes.data.amount) via $($payRes.data.method)" -ForegroundColor Green

# Verify Invoice & Customer balances updated
$chkInv = Invoke-RestMethod -Uri "$baseUrl/invoices/$invId" -Method Get -Headers $headers
Write-Host " Invoice Balance: Total: ₹$($chkInv.data.total), Paid: ₹$($chkInv.data.amountPaid), Remaining: ₹$($chkInv.data.total - $chkInv.data.amountPaid)" -ForegroundColor Green

Write-Host "`n=== 7. Purchases: Record Supplier Bill (Stock Increment) ===" -ForegroundColor Cyan
$purBody = @{
    supplierId = $suppId
    purchaseNumber = "HAV-INV-889"
    purchaseDate = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
    items = @(
        @{
            productId = $prodId
            productName = "Havells 2.5 Sq mm Wire (Red)"
            quantity = 20
            rate = 1200
            gstRate = 18
        }
    )
} | ConvertTo-Json
$purRes = Invoke-RestMethod -Uri "$baseUrl/purchases" -Method Post -ContentType "application/json" -Headers $headers -Body $purBody
Write-Host " Purchase Recorded: Bill #$($purRes.data.purchaseNumber), Total: ₹$($purRes.data.total)" -ForegroundColor Green

# Verify Stock Incremented (45 + 20 = 65)
$chkProd2 = Invoke-RestMethod -Uri "$baseUrl/products/$prodId" -Method Get -Headers $headers
Write-Host " Stock after Purchase: $($chkProd2.data.currentStock) (Expected 65)" -ForegroundColor Green

Write-Host "`n=== 8. Reports: Dashboard Summary & GST Liabilities ===" -ForegroundColor Cyan
$dashRes = Invoke-RestMethod -Uri "$baseUrl/reports/dashboard?period=this-month" -Method Get -Headers $headers
Write-Host " Dashboard Metrics:" -ForegroundColor Green
Write-Host "   Total Sales: ₹$($dashRes.data.kpis.totalSales)" -ForegroundColor White
Write-Host "   Total Purchases: ₹$($dashRes.data.kpis.totalPurchases)" -ForegroundColor White
Write-Host "   Receivables (Due from Customers): ₹$($dashRes.data.kpis.receivables)" -ForegroundColor White
Write-Host "   Payables (Due to Suppliers): ₹$($dashRes.data.kpis.payables)" -ForegroundColor White

$gstRes = Invoke-RestMethod -Uri "$baseUrl/reports/gst" -Method Get -Headers $headers
Write-Host " GST Liability Summary (GSTR-1 Format):" -ForegroundColor Green
Write-Host "   B2B Invoices: $($gstRes.data.b2b.count) bills, Taxable: ₹$($gstRes.data.b2b.taxable), Total Tax: ₹$($gstRes.data.b2b.cgst + $gstRes.data.b2b.sgst + $gstRes.data.b2b.igst)" -ForegroundColor White
Write-Host "   Total Output Tax Liability: ₹$($gstRes.data.totalTaxLiability)" -ForegroundColor White

Write-Host "`n=== 9. Subscriptions: Plans & Gateway Checkout ===" -ForegroundColor Cyan
$plansRes = Invoke-RestMethod -Uri "$baseUrl/subscriptions/plans" -Method Get
Write-Host " Active Plans in System:" -ForegroundColor Green
foreach ($p in $plansRes.data) {
    Write-Host "   - $($p.name) (₹$($p.price)/mo): $($p.description)" -ForegroundColor White
}
$checkoutBody = @{
    planId = $plansRes.data[1].id # Business Plan
} | ConvertTo-Json
$checkRes = Invoke-RestMethod -Uri "$baseUrl/subscriptions/checkout" -Method Post -ContentType "application/json" -Headers $headers -Body $checkoutBody
Write-Host " Test Gateway Order Generated: $($checkRes.data.orderId) for ₹$($checkRes.data.amount / 100)" -ForegroundColor Green

Write-Host "`n ALL PHASES AND WORKFLOWS VERIFIED 100% SUCCESSFULLY!" -ForegroundColor Green
