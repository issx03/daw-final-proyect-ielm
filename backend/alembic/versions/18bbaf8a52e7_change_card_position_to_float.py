"""change_card_position_to_float

Revision ID: 18bbaf8a52e7
Revises: f0012f7db523
Create Date: 2026-05-16 12:09:46.650980

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision: str = '18bbaf8a52e7'
down_revision: Union[str, Sequence[str], None] = 'f0012f7db523'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema: change cards.position from Integer to Float."""
    # Change column type from Integer to Float
    op.alter_column('cards', 'position',
               existing_type=mysql.INTEGER(),
               type_=mysql.FLOAT(),
               existing_nullable=True,
               existing_server_default=sa.text('0'))
    
    # Update existing data: convert integers to floats (0->1000, 1->2000, etc.)
    op.execute("""
        UPDATE cards 
        SET position = (position + 1) * 1000.0
        WHERE position IS NOT NULL
    """)


def downgrade() -> None:
    """Downgrade schema: revert cards.position back to Integer."""
    # Revert data first
    op.execute("""
        UPDATE cards 
        SET position = CAST((position / 1000.0) - 1 AS SIGNED)
        WHERE position IS NOT NULL
    """)
    
    # Change column type back to Integer
    op.alter_column('cards', 'position',
               existing_type=mysql.FLOAT(),
               type_=mysql.INTEGER(),
               existing_nullable=True,
               existing_server_default=sa.text('0'))
