
# Tabla para almacenar los mensajes del formulario
resource "aws_dynamodb_table" "contactos" {
  name         = "portfolio-contactos"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  # Identificador único de cada mensaje
  attribute {
    name = "id"
    type = "S"
  }

  # Cifrado en reposo
  server_side_encryption {
    enabled = true
  }

  tags = merge(local.common_tags, {
    Name = "portfolio-contactos"
  })
}

# Permitir que Lambda guarde mensajes en DynamoDB
resource "aws_iam_role_policy" "lambda_dynamodb" {
  name = "portfolio-lambda-dynamodb-policy"
  role = aws_iam_role.lambda_contacto.id

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [{
      Effect = "Allow"
      Action = [
        "dynamodb:PutItem"
      ]
      Resource = aws_dynamodb_table.contactos.arn
    }]
  })
}
