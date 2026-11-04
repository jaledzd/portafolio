
# Acceso privado de CloudFront al bucket S3
resource "aws_cloudfront_origin_access_control" "portfolio" {
  name                              = "portfolio-oac"
  description                       = "Acceso privado de CloudFront al bucket portfolio"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# Distribución CDN
resource "aws_cloudfront_distribution" "portfolio" {
  enabled         = true
  is_ipv6_enabled = true
  comment         = "Distribucion web del portfolio"
  price_class     = "PriceClass_100"

  # Los archivos están dentro de la carpeta frontend del bucket
  origin {
    domain_name              = aws_s3_bucket.portfolio.bucket_regional_domain_name
    origin_id                = "portfolio-s3-origin"
    origin_path              = "/frontend"
    origin_access_control_id = aws_cloudfront_origin_access_control.portfolio.id
  }

  # Página principal
  default_root_object = "index.html"

  default_cache_behavior {
    target_origin_id       = "portfolio-s3-origin"
    viewer_protocol_policy = "redirect-to-https"

    allowed_methods = ["GET", "HEAD", "OPTIONS"]
    cached_methods  = ["GET", "HEAD"]

    compress = true

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # Certificado HTTPS predeterminado de CloudFront
  viewer_certificate {
    cloudfront_default_certificate = true
    minimum_protocol_version       = "TLSv1.2_2021"
  }

  tags = merge(local.common_tags, {
    Name = "portfolio-cloudfront"
  })
}

# Permitir que únicamente esta distribución lea los objetos de S3
resource "aws_s3_bucket_policy" "portfolio_cloudfront" {
  bucket = aws_s3_bucket.portfolio.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontReadOnly"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.portfolio.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.portfolio.arn
          }
        }
      }
    ]
  })
}
