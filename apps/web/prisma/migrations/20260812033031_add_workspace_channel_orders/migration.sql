-- CreateTable
CREATE TABLE "workspace_channel_orders" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspace_id" UUID NOT NULL,
    "user_id" TEXT NOT NULL,
    "connected_account_id" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workspace_channel_orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "workspace_channel_orders_workspace_id_user_id_idx" ON "workspace_channel_orders"("workspace_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_channel_orders_workspace_id_user_id_connected_acc_key" ON "workspace_channel_orders"("workspace_id", "user_id", "connected_account_id");

-- AddForeignKey
ALTER TABLE "workspace_channel_orders" ADD CONSTRAINT "workspace_channel_orders_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_channel_orders" ADD CONSTRAINT "workspace_channel_orders_connected_account_id_fkey" FOREIGN KEY ("connected_account_id") REFERENCES "workspace_connected_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
