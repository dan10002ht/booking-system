#!/bin/bash
set -e

# Wait for master to be ready
until pg_isready -h postgres-master -p 5432 -U booking_user; do
  echo "Waiting for master database..."
  sleep 2
done

# Create recovery.conf for replication
cat > /var/lib/postgresql/data/recovery.conf <<EOF
standby_mode = 'on'
primary_conninfo = 'host=postgres-master port=5432 user=replicator password=replicator_pass'
primary_slot_name = 'replica_slot_1'
restore_command = 'cp /var/lib/postgresql/archive/%f %p'
recovery_target_timeline = 'latest'
EOF

# Set proper permissions
chown postgres:postgres /var/lib/postgresql/data/recovery.conf
chmod 600 /var/lib/postgresql/data/recovery.conf 