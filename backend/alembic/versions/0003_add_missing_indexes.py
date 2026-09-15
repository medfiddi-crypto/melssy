"""Add missing indexes to orders table.

Revision ID: 0003_add_missing_indexes
Revises: 0002_sheet_webhook_outbox
Create Date: 2026-09-15 14:15:00.000000

"""

from alembic import op


revision = "0003_add_missing_indexes"
down_revision = "0002_sheet_webhook_outbox"
branch_labels = None
depends_on = None


def upgrade():
    # Only create index on phone_e164 (since order_number and idempotency_key
    # already have unique constraints created in 0001_orders which automatically creates the index)
    op.create_index("ix_orders_phone_e164", "orders", ["phone_e164"], unique=False)
    op.create_index("ix_orders_order_number", "orders", ["order_number"], unique=True)
    op.create_index("ix_orders_idempotency_key", "orders", ["idempotency_key"], unique=True)


def downgrade():
    op.drop_index("ix_orders_idempotency_key", table_name="orders")
    op.drop_index("ix_orders_order_number", table_name="orders")
    op.drop_index("ix_orders_phone_e164", table_name="orders")
