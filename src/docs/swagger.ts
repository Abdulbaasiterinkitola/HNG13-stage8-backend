export const swaggerDocument = {
    "openapi": "3.0.0",
    "info": {
        "title": "Wallet Service API",
        "version": "1.0.0",
        "description": "Backend wallet service with Paystack integration, Google Auth, and Atomic Transfers."
    },
    "scheme": "bearer",
    "bearerFormat": "JWT"
},
"apiKeyAuth": {
    "type": "apiKey",
        "in": "header",
            "name": "x-api-key"
}
        }
    },
"security": [
    {
        "bearerAuth": []
    },
    {
        "apiKeyAuth": []
    }
],
    "paths": {
    "/auth/google": {
        "get": {
            "summary": "Initiate Google Login",
                "tags": [
                    "Authentication"
                ],
                    "responses": {
                "302": {
                    "description": "Redirects to Google Sign-In"
                }
            }
        }
    },
    "/wallet/balance": {
        "get": {
            "summary": "Get Wallet Balance",
                "tags": [
                    "Wallet"
                ],
                    "responses": {
                "200": {
                    "description": "Validation successful",
                        "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                    "properties": {
                                    "balance": {
                                        "type": "number",
                                            "example": 5000
                                    },
                                    "currency": {
                                        "type": "string",
                                            "example": "NGN"
                                    },
                                    "account_number": {
                                        "type": "string",
                                            "example": "1234567890"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    "/wallet/deposit": {
        "post": {
            "summary": "Initialize Deposit",
                "tags": [
                    "Wallet"
                ],
                    "requestBody": {
                "required": true,
                    "content": {
                    "application/json": {
                        "schema": {
                            "type": "object",
                                "properties": {
                                "amount": {
                                    "type": "number",
                                        "example": 5000
                                }
                            }
                        }
                    }
                }
            },
            "responses": {
                "200": {
                    "description": "Payment initialized",
                        "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                    "properties": {
                                    "reference": {
                                        "type": "string"
                                    },
                                    "authorization_url": {
                                        "type": "string"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    "/wallet/transfer": {
        "post": {
            "summary": "Transfer Funds",
                "tags": [
                    "Wallet"
                ],
                    "requestBody": {
                "required": true,
                    "content": {
                    "application/json": {
                        "schema": {
                            "type": "object",
                                "properties": {
                                "wallet_number": {
                                    "type": "string",
                                        "description": "Recipient Account Number",
                                            "example": "1234567890"
                                },
                                "amount": {
                                    "type": "number",
                                        "example": 1000
                                }
                            }
                        }
                    }
                }
            },
            "responses": {
                "200": {
                    "description": "Transfer successful"
                }
            }
        }
    },
    "/wallet/transactions": {
        "get": {
            "summary": "Get Transaction History",
                "tags": [
                    "Wallet"
                ],
                    "responses": {
                "200": {
                    "description": "List of transactions"
                }
            }
        }
    },
    "/keys/create": {
        "post": {
            "summary": "Create API Key",
                "tags": [
                    "API Keys"
                ],
                    "requestBody": {
                "content": {
                    "application/json": {
                        "schema": {
                            "type": "object",
                                "properties": {
                                "name": {
                                    "type": "string",
                                        "example": "Service A"
                                },
                                "permissions": {
                                    "type": "array",
                                        "items": {
                                        "type": "string"
                                    },
                                    "example": [
                                        "read",
                                        "deposit"
                                    ]
                                },
                                "expiry": {
                                    "type": "string",
                                        "example": "1M"
                                }
                            }
                        }
                    }
                }
            },
            "responses": {
                "201": {
                    "description": "Key created"
                }
            }
        }
    },
    "/keys/rollover": {
        "post": {
            "summary": "Rollover Expired Key",
                "tags": [
                    "API Keys"
                ],
                    "requestBody": {
                "content": {
                    "application/json": {
                        "schema": {
                            "type": "object",
                                "properties": {
                                "expired_key_id": {
                                    "type": "string"
                                },
                                "expiry": {
                                    "type": "string",
                                        "example": "1Y"
                                }
                            }
                        }
                    }
                }
            },
            "responses": {
                "200": {
                    "description": "Key rolled over"
                }
            }
        }
    }
}
};
