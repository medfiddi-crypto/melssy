"""Create MELSSY order tables."""
from alembic import op
import sqlalchemy as sa

revision = "0001_orders"
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table("orders", sa.Column("id", sa.Uuid(), primary_key=True), sa.Column("order_number", sa.String(24), nullable=False, unique=True), sa.Column("idempotency_key", sa.Uuid(), nullable=False, unique=True), sa.Column("customer_name", sa.String(120), nullable=False), sa.Column("phone_e164", sa.String(16), nullable=False), sa.Column("currency", sa.String(3), nullable=False), sa.Column("subtotal", sa.Numeric(10, 2), nullable=False), sa.Column("discount_total", sa.Numeric(10, 2), nullable=False), sa.Column("total", sa.Numeric(10, 2), nullable=False), sa.Column("possible_duplicate", sa.Boolean(), nullable=False), sa.Column("upsell_decision", sa.String(16)), sa.Column("utm_source", sa.String(255)), sa.Column("utm_campaign", sa.String(255)), sa.Column("fbclid", sa.String(512)), sa.Column("ttclid", sa.String(512)), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()))
    op.create_table("order_items", sa.Column("id", sa.Uuid(), primary_key=True), sa.Column("order_id", sa.Uuid(), sa.ForeignKey("orders.id"), nullable=False), sa.Column("product_id", sa.String(80), nullable=False), sa.Column("product_name", sa.String(160), nullable=False), sa.Column("quantity", sa.Integer(), nullable=False), sa.Column("unit_price", sa.Numeric(10, 2), nullable=False))
    op.create_table("tracking_outbox", sa.Column("id", sa.Uuid(), primary_key=True), sa.Column("event_type", sa.String(64), nullable=False), sa.Column("payload", sa.Text(), nullable=False), sa.Column("attempts", sa.Integer(), nullable=False), sa.Column("delivered_at", sa.DateTime(timezone=True)), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()))
def downgrade():
    op.drop_table("tracking_outbox")
    op.drop_table("order_items")
    op.drop_table("orders")
