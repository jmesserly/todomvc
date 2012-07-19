document.querySelector('#todoapp').model = {
    newTodo: '',
    todos: [ ],
    completeCount: 0,

    create: function() {
      function Todo(parent) {
        this.name = parent.newTodo;
        parent.newTodo = '';
        this.toggle = function() { parent.toggle(this); };
        this.destroy = function() { parent.remove(this); };
      }

      this.todos.push(new Todo(this));
    },
    remove: function(todo) {
      this.todos.splice(this.todos.indexOf(todo), 1);
      if (todo.complete)
        this.completeCount--;
    },
    toggle: function(todo) {
      this.completeCount += todo.complete ? 1 : -1;
    },
    clearCompleted: function() {
      for (var i = this.todos.length - 1; i >= 0; --i) {
        if (this.todos[i].complete)
          this.todos.splice(i, 1);
      }
      this.completeCount = 0;
    },

    // FIXME: Should be handled by a getter/setter bound to the checkbox
    toggleAll: function() {
      var complete = this.todos.length == this.completeCount ? false : true;
      this.todos.forEach(function(todo) { todo.complete = complete });
      this.completeCount = complete ? this.todos.length : 0;
    },
};
document.querySelector('#todoapp').modelDelegate = MDVDelegate;
