(function( window ) {

'use strict';

function TodoListController(root) {
	this.model = {
		newTodo: '',
		todos: [
		],
		completeCount: 0,
		incompleteCount: 0
	};
}

TodoListController.prototype = {
	endEditing: function() {
		if (!this.currentlyEditing)
			return;
		delete this.currentlyEditing.editing;
		this.currentlyEditing = undefined;
	},

	create: function(rootModel, e) {
		e.preventDefault(); // don't submit the form.
		this.model.todos.push({
			name: this.model.newTodo,
			foo: 1
		});
		this.model.newTodo = '';
		this.model.incompleteCount++;
	},

	edit: function(todo) {
		this.currentlyEditing = todo;
		todo.editing = true;
	},

	delete: function(todo) {
		var todos = this.model.todos;
		var index = todos.indexOf(todo);
		todos.splice(index, 1);
		if (todo.complete)
			this.model.completeCount--;
		else
			this.model.incompleteCount--;
	},

	clearCompleted: function() {
		var count = this.model.todos.length;
		while (count-- > 0) {
			var todo = this.model.todos[count];
			if (todo.complete)
				this.model.todos.splice(count, 1);
		}

		this.model.completeCount = 0;
	},

	toggleCompleted: function(todo) {
		todo.complete = !todo.complete;
		this.model.incompleteCount += todo.complete ? -1 : 1;
		this.model.completeCount += todo.complete ? 1 : -1;
	}
};

window.TodoListController = TodoListController;

})( window );