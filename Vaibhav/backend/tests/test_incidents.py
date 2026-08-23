from datetime import datetime, timezone

from fastapi import BackgroundTasks

from app.routers.incidents import create_incident_action
from app.schemas.incident import IncidentActionRequest


class StubDocument:
    exists = True

    def get(self):
        return self

    def to_dict(self):
        return {"zone_id": "zone-1"}


class StubIncidentCollection:
    def document(self, incident_id):
        return StubDocument()


class StubActionDocument:
    def set(self, data):
        self.data = data


class StubActionsCollection:
    def document(self, action_id):
        return StubActionDocument()


class StubDB:
    def collection(self, name):
        if name == "incidents":
            return StubIncidentCollection()
        return StubActionsCollection()


def test_incident_action_schedules_zone_filtered_update(monkeypatch):
    audit = {}
    broadcasts = []

    def record_audit(**kwargs):
        audit.update(kwargs)

    async def record_broadcast(*args, **kwargs):
        broadcasts.append((args, kwargs))

    monkeypatch.setattr("app.routers.incidents.get_firestore", lambda: StubDB())
    monkeypatch.setattr("app.routers.incidents.create_audit_log", record_audit)
    monkeypatch.setattr("app.routers.incidents.manager.broadcast_event", record_broadcast)

    background_tasks = BackgroundTasks()
    response = create_incident_action(
        incident_id="incident-1",
        request=IncidentActionRequest(action="ESCALATE", notes="Review"),
        background_tasks=background_tasks,
        user={"uid": "authority-1", "role": "AUTHORITY"},
    )

    assert response.success is True
    assert audit == {
        "user_id": "authority-1",
        "action": "ESCALATE",
        "resource_id": "incident-1",
    }
    assert len(background_tasks.tasks) == 1
    task = background_tasks.tasks[0]
    assert task.func is record_broadcast
    assert task.args[0] == "INCIDENT_UPDATED"
    assert task.args[1]["incident_id"] == "incident-1"
    assert task.kwargs == {"zone_id": "zone-1"}
