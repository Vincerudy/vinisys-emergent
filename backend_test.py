#!/usr/bin/env python3
"""
Backend API Testing Script for Vinisys Application
Tests the POST /api/produit endpoint that was recently fixed for 500 errors.
"""

import requests
import json
import sys
from datetime import datetime

# Backend URL configuration
BASE_URL = "http://localhost:8001"
API_BASE = f"{BASE_URL}/api"

def print_test_header(test_name):
    """Print formatted test header"""
    print(f"\n{'='*60}")
    print(f"TEST: {test_name}")
    print(f"{'='*60}")

def print_test_result(success, message, response=None):
    """Print formatted test result"""
    status = "✅ PASSED" if success else "❌ FAILED"
    print(f"{status}: {message}")
    if response and hasattr(response, 'status_code'):
        print(f"Status Code: {response.status_code}")
        if response.headers.get('content-type', '').startswith('application/json'):
            try:
                print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
            except:
                print(f"Response Text: {response.text}")
        else:
            print(f"Response Text: {response.text}")
    print("-" * 60)

def test_database_connection():
    """Test database connection"""
    print_test_header("Database Connection Test")
    try:
        response = requests.get(f"{BASE_URL}/test-db", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "Connexion réussie" in data.get("message", ""):
                print_test_result(True, "Database connection successful", response)
                return True
            else:
                print_test_result(False, "Database connection failed - unexpected response", response)
                return False
        else:
            print_test_result(False, f"Database connection failed - HTTP {response.status_code}", response)
            return False
    except Exception as e:
        print_test_result(False, f"Database connection failed - {str(e)}")
        return False

def test_create_product_complete_data():
    """Test 1: Create product with complete data"""
    print_test_header("Create Product with Complete Data")
    
    product_data = {
        "nom": "Ordinateur Portable Dell",
        "description": "Ordinateur portable Dell Inspiron 15 pouces",
        "prixUnitaire": "899.99",
        "quantiteEnStock": "25",
        "seuil": "5",
        "fournisseur": "Dell Technologies",
        "prixUnitaireHT": "749.99",
        "tva": "20",
        "categorie": "Informatique",
        "sousCategorie": "Ordinateurs",
        "societeId": "2"
    }
    
    try:
        response = requests.post(f"{API_BASE}/produit", json=product_data, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if "Produit enregistré avec succès" in data.get("message", "") and "produitId" in data:
                print_test_result(True, f"Product created successfully with ID: {data['produitId']}", response)
                return True, data.get("produitId")
            else:
                print_test_result(False, "Unexpected response format", response)
                return False, None
        else:
            print_test_result(False, f"Product creation failed - HTTP {response.status_code}", response)
            return False, None
            
    except Exception as e:
        print_test_result(False, f"Product creation failed - {str(e)}")
        return False, None

def test_create_product_minimal_data():
    """Test 2: Create product with minimal required data"""
    print_test_header("Create Product with Minimal Data")
    
    product_data = {
        "nom": "Produit Minimal",
        "prixUnitaire": "50.00",
        "quantiteEnStock": "10",
        "societeId": "2"
    }
    
    try:
        response = requests.post(f"{API_BASE}/produit", json=product_data, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if "Produit enregistré avec succès" in data.get("message", "") and "produitId" in data:
                print_test_result(True, f"Minimal product created successfully with ID: {data['produitId']}", response)
                return True, data.get("produitId")
            else:
                print_test_result(False, "Unexpected response format", response)
                return False, None
        else:
            print_test_result(False, f"Minimal product creation failed - HTTP {response.status_code}", response)
            return False, None
            
    except Exception as e:
        print_test_result(False, f"Minimal product creation failed - {str(e)}")
        return False, None

def test_create_product_missing_required_data():
    """Test 3: Create product without required data (should return 400)"""
    print_test_header("Create Product without Required Data (Should Fail)")
    
    # Missing prixUnitaire, quantiteEnStock, and societeId
    product_data = {
        "nom": "Produit Incomplet",
        "description": "Ce produit manque des données obligatoires"
    }
    
    try:
        response = requests.post(f"{API_BASE}/produit", json=product_data, timeout=10)
        
        if response.status_code == 400:
            data = response.json()
            if "obligatoires" in data.get("error", "").lower():
                print_test_result(True, "Correctly rejected product with missing required data", response)
                return True
            else:
                print_test_result(False, "Wrong error message for missing data", response)
                return False
        else:
            print_test_result(False, f"Should have returned 400 but got {response.status_code}", response)
            return False
            
    except Exception as e:
        print_test_result(False, f"Test failed with exception - {str(e)}")
        return False

def test_update_existing_product(product_id):
    """Test 4: Update existing product"""
    print_test_header(f"Update Existing Product (ID: {product_id})")
    
    if not product_id:
        print_test_result(False, "No product ID available for update test")
        return False
    
    updated_data = {
        "id": str(product_id),
        "nom": "Ordinateur Portable Dell - Mis à jour",
        "description": "Ordinateur portable Dell Inspiron 15 pouces - Version mise à jour",
        "prixUnitaire": "949.99",
        "quantiteEnStock": "30",
        "seuil": "8",
        "fournisseur": "Dell Technologies France",
        "prixUnitaireHT": "791.66",
        "tva": "20",
        "categorie": "Informatique",
        "sousCategorie": "Ordinateurs Portables",
        "societeId": "2"
    }
    
    try:
        response = requests.post(f"{API_BASE}/produit", json=updated_data, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if "Produit enregistré avec succès" in data.get("message", ""):
                print_test_result(True, f"Product updated successfully", response)
                return True
            else:
                print_test_result(False, "Unexpected response format for update", response)
                return False
        else:
            print_test_result(False, f"Product update failed - HTTP {response.status_code}", response)
            return False
            
    except Exception as e:
        print_test_result(False, f"Product update failed - {str(e)}")
        return False

def test_database_verification():
    """Test 5: Verify products are created in database"""
    print_test_header("Database Verification Test")
    
    # This is a basic test to verify the database connection is working
    # In a real scenario, we would query the products table directly
    try:
        response = requests.get(f"{BASE_URL}/test-db", timeout=10)
        if response.status_code == 200:
            print_test_result(True, "Database is accessible and responding", response)
            return True
        else:
            print_test_result(False, "Database verification failed", response)
            return False
    except Exception as e:
        print_test_result(False, f"Database verification failed - {str(e)}")
        return False

def main():
    """Main test execution"""
    print("🚀 Starting Backend API Tests for POST /api/produit endpoint")
    print(f"Backend URL: {BASE_URL}")
    print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Track test results
    test_results = []
    
    # Test 1: Database connection
    db_connected = test_database_connection()
    test_results.append(("Database Connection", db_connected))
    
    if not db_connected:
        print("\n❌ Database connection failed. Stopping tests.")
        return False
    
    # Test 2: Create product with complete data
    success, product_id = test_create_product_complete_data()
    test_results.append(("Create Product (Complete Data)", success))
    
    # Test 3: Create product with minimal data
    success_minimal, minimal_product_id = test_create_product_minimal_data()
    test_results.append(("Create Product (Minimal Data)", success_minimal))
    
    # Test 4: Create product without required data (should fail)
    success_validation = test_create_product_missing_required_data()
    test_results.append(("Validation (Missing Data)", success_validation))
    
    # Test 5: Update existing product
    if product_id:
        success_update = test_update_existing_product(product_id)
        test_results.append(("Update Product", success_update))
    else:
        test_results.append(("Update Product", False))
        print_test_result(False, "Cannot test update - no product ID available")
    
    # Test 6: Database verification
    success_db_verify = test_database_verification()
    test_results.append(("Database Verification", success_db_verify))
    
    # Print summary
    print(f"\n{'='*60}")
    print("TEST SUMMARY")
    print(f"{'='*60}")
    
    passed = 0
    total = len(test_results)
    
    for test_name, result in test_results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{status}: {test_name}")
        if result:
            passed += 1
    
    print(f"\nResults: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! The /api/produit endpoint is working correctly.")
        return True
    else:
        print("⚠️  Some tests failed. Please check the issues above.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)