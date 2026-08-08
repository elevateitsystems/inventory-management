CREATE TABLE "owners" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "owners_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "raw_materials" (
    "id" BIGSERIAL NOT NULL,
    "owner_id" BIGINT NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "sku" VARCHAR(80) NOT NULL,
    "unit" VARCHAR(30) NOT NULL,
    "opening_stock" DECIMAL(18,3) NOT NULL DEFAULT 0 CHECK ("opening_stock" >= 0),
    "reorder_level" DECIMAL(18,3) NOT NULL DEFAULT 0 CHECK ("reorder_level" >= 0),
    "unit_cost" DECIMAL(18,2) NOT NULL DEFAULT 0 CHECK ("unit_cost" >= 0),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "raw_materials_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "finished_products" (
    "id" BIGSERIAL NOT NULL,
    "owner_id" BIGINT NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "sku" VARCHAR(80) NOT NULL,
    "unit" VARCHAR(30) NOT NULL,
    "opening_stock" DECIMAL(18,3) NOT NULL DEFAULT 0 CHECK ("opening_stock" >= 0),
    "reorder_level" DECIMAL(18,3) NOT NULL DEFAULT 0 CHECK ("reorder_level" >= 0),
    "sale_price" DECIMAL(18,2) NOT NULL DEFAULT 0 CHECK ("sale_price" >= 0),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "finished_products_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "customers" (
    "id" BIGSERIAL NOT NULL,
    "owner_id" BIGINT NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "phone" VARCHAR(60) NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "purchases" (
    "id" BIGSERIAL NOT NULL,
    "owner_id" BIGINT NOT NULL,
    "supplier" VARCHAR(160) NOT NULL,
    "material_id" BIGINT NOT NULL,
    "quantity" DECIMAL(18,3) NOT NULL CHECK ("quantity" > 0),
    "unit_cost" DECIMAL(18,2) NOT NULL CHECK ("unit_cost" >= 0),
    "occurred_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "purchases_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "productions" (
    "id" BIGSERIAL NOT NULL,
    "owner_id" BIGINT NOT NULL,
    "material_id" BIGINT NOT NULL,
    "material_quantity" DECIMAL(18,3) NOT NULL CHECK ("material_quantity" > 0),
    "product_id" BIGINT NOT NULL,
    "product_quantity" DECIMAL(18,3) NOT NULL CHECK ("product_quantity" > 0),
    "occurred_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "productions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sales" (
    "id" BIGSERIAL NOT NULL,
    "owner_id" BIGINT NOT NULL,
    "customer_id" BIGINT NOT NULL,
    "product_id" BIGINT NOT NULL,
    "quantity" DECIMAL(18,3) NOT NULL CHECK ("quantity" > 0),
    "unit_price" DECIMAL(18,2) NOT NULL CHECK ("unit_price" >= 0),
    "occurred_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sales_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "product_returns" (
    "id" BIGSERIAL NOT NULL,
    "owner_id" BIGINT NOT NULL,
    "customer_id" BIGINT NOT NULL,
    "product_id" BIGINT NOT NULL,
    "quantity" DECIMAL(18,3) NOT NULL CHECK ("quantity" > 0),
    "unit_price" DECIMAL(18,2) NOT NULL CHECK ("unit_price" >= 0),
    "occurred_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "product_returns_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "payments" (
    "id" BIGSERIAL NOT NULL,
    "owner_id" BIGINT NOT NULL,
    "customer_id" BIGINT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL CHECK ("amount" > 0),
    "occurred_at" TIMESTAMPTZ(6) NOT NULL,
    "note" VARCHAR(500) NOT NULL DEFAULT 'Customer payment received',
    "sale_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "owners_email_unique" ON "owners"("email");
CREATE UNIQUE INDEX "raw_materials_owner_sku_unique" ON "raw_materials"("owner_id", "sku");
CREATE UNIQUE INDEX "finished_products_owner_sku_unique" ON "finished_products"("owner_id", "sku");
CREATE UNIQUE INDEX "customers_owner_email_unique" ON "customers"("owner_id", "email");
CREATE INDEX "purchases_owner_date_idx" ON "purchases"("owner_id", "occurred_at" DESC);
CREATE INDEX "productions_owner_date_idx" ON "productions"("owner_id", "occurred_at" DESC);
CREATE INDEX "sales_owner_date_idx" ON "sales"("owner_id", "occurred_at" DESC);
CREATE INDEX "product_returns_owner_date_idx" ON "product_returns"("owner_id", "occurred_at" DESC);
CREATE INDEX "payments_owner_date_idx" ON "payments"("owner_id", "occurred_at" DESC);

ALTER TABLE "raw_materials" ADD CONSTRAINT "raw_materials_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "owners"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "finished_products" ADD CONSTRAINT "finished_products_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "owners"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "customers" ADD CONSTRAINT "customers_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "owners"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "owners"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "raw_materials"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "productions" ADD CONSTRAINT "productions_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "owners"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "productions" ADD CONSTRAINT "productions_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "raw_materials"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "productions" ADD CONSTRAINT "productions_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "finished_products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "sales" ADD CONSTRAINT "sales_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "owners"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "sales" ADD CONSTRAINT "sales_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "sales" ADD CONSTRAINT "sales_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "finished_products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "product_returns" ADD CONSTRAINT "product_returns_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "owners"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "product_returns" ADD CONSTRAINT "product_returns_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "product_returns" ADD CONSTRAINT "product_returns_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "finished_products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "payments" ADD CONSTRAINT "payments_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "owners"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "payments" ADD CONSTRAINT "payments_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "payments" ADD CONSTRAINT "payments_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "sales"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
