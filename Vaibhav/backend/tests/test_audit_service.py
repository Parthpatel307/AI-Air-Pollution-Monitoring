from app.services.audit_service import create_audit_log


def test_create_audit_log_structure(monkeypatch):
    # Monkeypatch firestore client to a simple in-memory stub
    class StubCollection:
        def __init__(self):
            self.docs = []

        def add(self, doc):
            self.docs.append(doc)

    class StubDB:
        def __init__(self):
            self._collections = {}

        def collection(self, name):
            if name not in self._collections:
                self._collections[name] = StubCollection()
            return self._collections[name]

    stub_db = StubDB()

    monkeypatch.setattr("app.database.db", stub_db)

    record = create_audit_log(user_id="uid_123", action="TEST_ACTION", resource_id="res_1")

    assert record.user_id == "uid_123"
    assert record.action == "TEST_ACTION"
    assert record.resource_id == "res_1"
    assert record.timestamp is not None
    assert stub_db._collections["audit_logs"].docs[0]["user_id"] == "uid_123"
    assert stub_db._collections["audit_logs"].docs[0]["action"] == "TEST_ACTION"
    assert stub_db._collections["audit_logs"].docs[0]["resource_id"] == "res_1"
    assert stub_db._collections["audit_logs"].docs[0]["timestamp"] == record.timestamp
