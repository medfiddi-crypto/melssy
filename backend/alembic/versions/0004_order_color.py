"""Add nullable order color without changing existing orders."""

import sqlalchemy as sa

from alembic import op

revision = "0004_order_color"
down_revision = "0003_add_missing_indexes"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("orders", sa.Column("color", sa.String(16), nullable=True))


def downgrade():
    op.drop_column("orders", "color")