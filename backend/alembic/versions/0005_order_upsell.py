"""Add nullable upsell token and colors without changing existing orders."""

import sqlalchemy as sa

from alembic import op

revision = "0005_order_upsell"
down_revision = "0004_order_color"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("orders", sa.Column("upsell_token", sa.String(64), nullable=True))
    op.add_column("orders", sa.Column("upsell_colors", sa.String(40), nullable=True))


def downgrade():
    op.drop_column("orders", "upsell_colors")
    op.drop_column("orders", "upsell_token")
