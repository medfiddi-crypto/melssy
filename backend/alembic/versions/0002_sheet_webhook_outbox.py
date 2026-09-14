"""Add Sheets fulfillment fields and durable webhook outbox."""

from alembic import op
import sqlalchemy as sa


revision = "0002_sheet_webhook_outbox"
down_revision = "0001_orders"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("orders", sa.Column("full_address", sa.String(500), nullable=True))
    op.add_column("orders", sa.Column("city", sa.String(120), nullable=True))
    op.create_table(
        "sheet_webhook_outbox",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("event_type", sa.String(64), nullable=False),
        sa.Column("payload", sa.Text(), nullable=False),
        sa.Column("attempts", sa.Integer(), nullable=False),
        sa.Column("delivered_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade():
    op.drop_table("sheet_webhook_outbox")
    op.drop_column("orders", "city")
    op.drop_column("orders", "full_address")