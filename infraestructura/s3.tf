
resource "aws_s3_bucket" "portfolio" {
  bucket = var.bucket_name

  tags = merge(local.common_tags, {
    Name        = "portfolio"
    Description = "Almacenamiento de la página web del portfolio"
  })
}


# Bloquear cualquier acceso público al bucket
resource "aws_s3_bucket_public_access_block" "portfolio" {
  bucket = aws_s3_bucket.portfolio.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
