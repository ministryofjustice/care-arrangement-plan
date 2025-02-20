resource "aws_vpc" "vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "VPC${local.suffix}"
  }
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.vpc.id

  tags = {
    Name = "IGW${local.suffix}"
  }
}

resource "aws_subnet" "public_subnets" {
  count                   = length(local.availability_zones)
  vpc_id                  = aws_vpc.vpc.id
  cidr_block              = local.public_subnet_cids[count.index]
  availability_zone       = local.availability_zones[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "PublicSubnet${local.az_labels[count.index]}${local.suffix}"
  }
}

resource "aws_route_table" "public_route_table" {
  vpc_id = aws_vpc.vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name = "PublicRouteTable${local.suffix}"
  }
}

resource "aws_route_table_association" "public_associations" {
  count          = length(local.availability_zones)
  subnet_id      = aws_subnet.public_subnets[count.index].id
  route_table_id = aws_route_table.public_route_table.id
}

resource "aws_subnet" "private_subnets" {
  count             = length(local.availability_zones)
  vpc_id            = aws_vpc.vpc.id
  cidr_block        = local.private_subnet_cids[count.index]
  availability_zone = local.availability_zones[count.index]

  tags = {
    Name = "PrivateSubnet${local.az_labels[count.index]}${local.suffix}"
  }
}

resource "aws_eip" "nat_gateway_eips" {
  count  = length(local.availability_zones)
  domain = "vpc"

  tags = {
    Name = "NatGatewayEIP${local.az_labels[count.index]}${local.suffix}"
  }
}

resource "aws_nat_gateway" "nat_gateways" {
  count         = length(local.availability_zones)
  allocation_id = aws_eip.nat_gateway_eips[count.index].id
  subnet_id     = aws_subnet.public_subnets[count.index].id
  depends_on    = [aws_internet_gateway.igw]

  tags = {
    Name = "NatGateway${local.az_labels[count.index]}${local.suffix}"
  }
}

resource "aws_route_table" "private_route_tables" {
  count  = length(local.availability_zones)
  vpc_id = aws_vpc.vpc.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat_gateways[count.index].id
  }

  tags = {
    Name = "PrivateRouteTable${local.az_labels[count.index]}${local.suffix}"
  }
}

resource "aws_route_table_association" "private_associations" {
  count          = length(local.availability_zones)
  subnet_id      = aws_subnet.private_subnets[count.index].id
  route_table_id = aws_route_table.private_route_tables[count.index].id
}
