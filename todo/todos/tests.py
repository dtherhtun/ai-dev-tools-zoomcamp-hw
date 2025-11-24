from django.test import TestCase
from django.utils import timezone
from .models import Todo
import datetime

class TodoModelTest(TestCase):
    def test_todo_creation(self):
        todo = Todo.objects.create(
            title="Test Todo",
            description="This is a test todo item.",
            due_date=timezone.now().date() + datetime.timedelta(days=1),
            resolved=False
        )
        self.assertEqual(todo.title, "Test Todo")
        self.assertEqual(todo.description, "This is a test todo item.")
        self.assertFalse(todo.resolved)
        self.assertIsNotNone(todo.created_at)
        self.assertIsNotNone(todo.updated_at)

    def test_is_overdue_method(self):
        # Test a todo that is not overdue
        future_date = timezone.now().date() + datetime.timedelta(days=5)
        todo_not_overdue = Todo.objects.create(
            title="Not Overdue",
            due_date=future_date,
            resolved=False
        )
        self.assertFalse(todo_not_overdue.is_overdue())

        # Test a todo that is overdue
        past_date = timezone.now().date() - datetime.timedelta(days=5)
        todo_overdue = Todo.objects.create(
            title="Overdue",
            due_date=past_date,
            resolved=False
        )
        self.assertTrue(todo_overdue.is_overdue())

        # Test a resolved todo that was overdue (should not be considered overdue)
        resolved_overdue = Todo.objects.create(
            title="Resolved Overdue",
            due_date=past_date,
            resolved=True
        )
        self.assertFalse(resolved_overdue.is_overdue())

        # Test a todo without a due date
        todo_no_due_date = Todo.objects.create(
            title="No Due Date",
            resolved=False
        )
        self.assertFalse(todo_no_due_date.is_overdue())

