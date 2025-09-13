Write-Host "=== Testing Backend API ===`n"

# Test root endpoint
Write-Host "=== Testing Root Endpoint ==="
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/" -Method Get -UseBasicParsing
    Write-Host "Status Code: $($response.StatusCode)"
    Write-Host "Response: $($response.Content)`n"
} catch {
    Write-Host "Error: $($_.Exception.Message)`n"
}

# Test login
Write-Host "=== Testing Login ==="
try {
    $body = @{
        username = "admin@smartrentals.com"
        password = "admin123"
    }
    
    $response = Invoke-WebRequest -Uri "http://localhost:8000/auth/login" `
        -Method Post `
        -Body $body `
        -UseBasicParsing `
        -ContentType "application/x-www-form-urlencoded"
    
    Write-Host "Status Code: $($response.StatusCode)"
    $jsonResponse = $response.Content | ConvertFrom-Json
    
    if ($jsonResponse.access_token) {
        $token = $jsonResponse.access_token
        Write-Host "Login successful! Token: $($token.Substring(0, [Math]::Min(20, $token.Length)))..."
        
        # Test protected endpoint with token
        Write-Host "`n=== Testing Protected Endpoint (Products) ==="
        try {
            $headers = @{
                "Authorization" = "Bearer $token"
                "Content-Type" = "application/json"
            }
            
            $response = Invoke-WebRequest -Uri "http://localhost:8000/products" `
                -Method Get `
                -Headers $headers `
                -UseBasicParsing
                
            Write-Host "Status Code: $($response.StatusCode)"
            $products = $response.Content | ConvertFrom-Json
            Write-Host "Found $($products.Count) products"
            if ($products -and $products.Count -gt 0) {
                Write-Host "First product: $($products[0] | ConvertTo-Json -Depth 1)"
            }
        } catch {
            Write-Host "Error testing protected endpoint: $($_.Exception.Message)"
        }
    } else {
        Write-Host "Login failed. Response: $($response.Content)"
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}

Write-Host "`nTest complete. Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
