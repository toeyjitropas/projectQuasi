CREATE OR REPLACE FUNCTION audit_trigger_fn()
RETURNS TRIGGER AS $$
DECLARE
  record_id TEXT;
  old_data  JSONB;
  new_data  JSONB;
BEGIN
  IF TG_OP = 'DELETE' THEN
    record_id := OLD.id;
    old_data  := row_to_json(OLD)::JSONB;
    new_data  := NULL;
  ELSIF TG_OP = 'INSERT' THEN
    record_id := NEW.id;
    old_data  := NULL;
    new_data  := row_to_json(NEW)::JSONB;
  ELSE
    record_id := NEW.id;
    old_data  := row_to_json(OLD)::JSONB;
    new_data  := row_to_json(NEW)::JSONB;
  END IF;

  INSERT INTO "AuditLog" ("id", "tableName", "recordId", "action", "oldData", "newData", "changedAt", "changedBy")
  VALUES (gen_random_uuid()::TEXT, TG_TABLE_NAME, record_id, TG_OP, old_data, new_data, NOW(), current_user);

  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS audit_events ON "Event";
CREATE TRIGGER audit_events
AFTER INSERT OR UPDATE OR DELETE ON "Event"
FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

DROP TRIGGER IF EXISTS audit_activities ON "Activity";
CREATE TRIGGER audit_activities
AFTER INSERT OR UPDATE OR DELETE ON "Activity"
FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

DROP TRIGGER IF EXISTS audit_investors ON "Investor";
CREATE TRIGGER audit_investors
AFTER INSERT OR UPDATE OR DELETE ON "Investor"
FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();
