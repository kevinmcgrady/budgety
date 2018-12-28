// The budget controller...
var budgetController = (function() {

  // function constructor for the expense.
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  // method to calculate the percentage for the Expences.
  Expense.prototype.calcPercentage = function(totalIncome) {
    if(totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  }
  // method to get the percentage for the expences.
  Expense.prototype.getPercentage = function() {
    return this.percentage;
  }

  // function constructor for the income.
  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  // function to calculate the total.
  var calculateTotal = function(type) {
    var sum = 0;
    data.allItems[type].forEach(function(current, index, array) {
      sum += current.value;
    });
    data.totals[type] = sum;
  };

  // object to store the data, expenses, incomes
  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  }

  return {
    // function to add a new item.
    addItem: function(type, des, val) {
      var newItem, ID;
      // create new id.
      if(data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }
      // create new item depending on type.
      if(type === 'exp') {
        newItem = new Expense(ID, des, val);
      } else if(type === 'inc') {
        newItem = new Income(ID, des, val);
      }
      // push the new item to data structure.
      data.allItems[type].push(newItem);
      // return new item.
      return newItem;
    },
    // function to calculate the budget.
    calculateBudget: function() {
      // 1. calculate total income and expenses.
      calculateTotal('exp');
      calculateTotal('inc')
      // 2. calculate the budget: income - inspenses.
      data.budget = data.totals.inc - data.totals.exp;
      // 3. calculate percentage of income.
      if(data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },
    // method to calculate percenteages.
    calculatePercentages: function() {
      data.allItems.exp.forEach(function(current) {
        current.calcPercentage(data.totals.inc);
      });
    },
    // method to get the percentages.
    getPercentages: function() {
      var allPercentages = data.allItems.exp.map(function(current) {
        return current.getPercentage();
      });
      return allPercentages;
    },
    // method to return the budget.
    getBudget: function() {
      return {
        budget: data.budget,
        totalIncome: data.totals.inc,
        totalExpenses: data.totals.exp,
        percentage: data.percentage
      }
    },
    // method to delete item.
    deleteItem: function(type, id) {
      var index, ids;
      // loop through the array using MAP (map is like the foreach, but creates a new array.)
      ids = data.allItems[type].map(function(current) {
        return current.id;
      });
      // get the id of the item.
      index = ids.indexOf(id);
      // delete the item using the SPLICE method
      if(index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },
    testing: function() {
      return data;
    }
  }

})();



// The UI controller.
var UIController = (function() {
  // object for the DOM strings to select elements.
  var DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputButton: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercentageLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
  }

  // function to format the numbers of the application.
  var formatNumber = function(num, type) {
    var numSplit, int, dec, type;

    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split('.');

    int = numSplit[0];
    if(int.length > 3) {
      int = int.substr(0,int.length - 3) + ',' + int.substr(int.length - 3,3);
    }
    dec = numSplit[1];

    return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
  }

  // function to loop through the list.
  var nodeListForEach = function(list, callback) {
    // loop through the list
    for(var i = 0; i < list.length; i++) {
      // call the callback function on every list item.
      callback(list[i], i);
    }
  }

  // return an objetc will all the methods.
  return {
    // method to get all the values.
    getInput: function() {
      // return the values to the function.
      return {
       type:  document.querySelector(DOMstrings.inputType).value,
       description: document.querySelector(DOMstrings.inputDescription).value,
       value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      }
    },
    addListItem: function(obj, type) {
      var html, newHtml, element;
      // 1. create HTML string with placeholder text.
      if(type === 'inc') {
        element = DOMstrings.incomeContainer;
        html = `<div class="item clearfix" id="inc-%id%">
            <div class="item__description">%description%</div>
            <div class="right clearfix">
                <div class="item__value">%value%</div>
                <div class="item__delete">
                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                </div>
            </div>
        </div>`;
      } else if(type === 'exp') {
        element = DOMstrings.expensesContainer;
        html = `<div class="item clearfix" id="exp-%id%">
            <div class="item__description">%description%</div>
            <div class="right clearfix">
                <div class="item__value">%value%</div>
                <div class="item__percentage">21%</div>
                <div class="item__delete">
                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                </div>
            </div>
        </div>`;
      }

      // 2. replace placeholder text.
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

      // 3. insert the HTML into the DOM.
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },
    // Method to return the DOMstrings so other controllers can use them.
    getDOMstrings: function() {
      // return the DOMstrings.
      return DOMstrings;
    },
    // Method to clear the fields.
    clearFields: function() {
      // init variables.
      var fields, fieldsArray;
      // select the input description and input value.
      fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
      // turn the list into an array by borrowing the slice method from the Array prototype.
      fieldsArray = Array.prototype.slice.call(fields);
      // loop thorough the array and clear each value.
      fieldsArray.forEach(function(current, index, array) {
        current.value = "";
      });
      // set focus on first element of array.
      fieldsArray[0].focus();
    },
    // function to display the totals (budget) to the page.
    displayBudget: function(obj) {
      var type;
      obj.budget > 0 ? type = 'inc' : type = 'exp';
      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalIncome, 'inc');
      document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExpenses, 'exp');

      if(obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = '---';
      }
    },
    // method to delete the item from the UI.
    deleteListItem: function(selectorId) {
      // store the element.
      var element = document.getElementById(selectorId);
      // get the parent node of the element and then remove the element.
      element.parentNode.removeChild(element);
    },
    // method to display the percentages.
    displayPercentages: function(percentages) {
      // get the fields.
      var fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);
      // call the function with the elements.
      nodeListForEach(fields, function(current, index) {
        if(percentages[index] > 0) {
          current.textContent = percentages[index] + '%';
        } else {
          current.textContent = '---';
        }
      });
    },
    // method to display the current month and year.
    displayMonth: function() {
      var now, year, month, months;
      now = new Date();
      year = now.getFullYear();
      months = ['January', 'Febuary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      month = now.getMonth();
      document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
    },
    // method to change the input colours for either a income or expanse.
    changeType: function() {
      // get the fields.
      var fields = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
      // call the nodeListForEach function.
      nodeListForEach(fields, function(current) {
        // change toggle the class of red-focus.
        current.classList.toggle('red-focus');
      });
      // change the colour of the button as well.
      document.querySelector(DOMstrings.inputButton).classList.toggle('red');
    }
  };

})();



// The app controller. Pass in the other two controllers.
var controller = (function(budgetCtrl, UICtrl) {
  var setupEventListeners = function() {
    // variable to store the DOMstrings.
    var DOM = UICtrl.getDOMstrings();

    // event listener for the add button -- pass in the ctrlAddItem function.
    document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);

    // when the enter key is pressed -- call the ctrlAddItem function again.
    document.addEventListener('keypress', function(event) {
      if(event.keyCode === 13 || event.which === 13) {
        // call the ctrlAddItem function.
        ctrlAddItem();
      }
    });
    // event listener to delete an item.
    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    // event listener for change event (when the user selects either a income or expense)
    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
  }
  // function to update the budget.
  var updateBudget = function() {
    // 1. calculate the budget.
    budgetCtrl.calculateBudget();
    // 2. return the budget.
    var budget = budgetCtrl.getBudget();
    // 3. display budget on UI.
    UICtrl.displayBudget(budget);
  }
  // function to update the percentages.
  var updatePercentages = function() {
    // 1. calculate the percentages.
    budgetCtrl.calculatePercentages();
    // 2. read them from the budget controller.
    var percentages = budgetCtrl.getPercentages();
    // 3. update UI.
    UICtrl.displayPercentages(percentages);
  }
  // function to add an item.
  var ctrlAddItem = function() {
    var input, newItem;
    // 1. get input data.
    input = UICtrl.getInput();
    // validation -- new item will only be added if the description has a value, the input value is a number and is more than 0.
    if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
      // 2. add item to the budget controller.
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);
      // 3. add new item to user interface.
      UICtrl.addListItem(newItem, input.type);
      // 4. clear the fields.
      UICtrl.clearFields();
      // 5. calculate and update budget.
      updateBudget();
      // 6. calculate and update percenteages.
      updatePercentages();
    }
  }
  // function to delete an item.
  var ctrlDeleteItem = function(event) {
    // init variables.
    var itemId, splitID, type, id;
    // get the item id from the items.
    itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
    // if the id exists.
    if(itemId) {
      // split the string and store the values.
      splitID = itemId.split('-');
      type = splitID[0];
      id = parseInt(splitID[1]);

      // 1. delete the item from the data structure.
      budgetCtrl.deleteItem(type, id);
      // 2. delete the item from the UI.
      UICtrl.deleteListItem(itemId);
      // 3. update and show the new budget.
      updateBudget();
      // 4. calculate and update percentages.
      updatePercentages();
    }
  }

  // return an object with the init function.
  return {
    init: function() {
      // call the setupEventListeners function.
      setupEventListeners();
      // display the year and month.
      UICtrl.displayMonth();
      // clear budget when application starts.
      UICtrl.displayBudget({
        budget: 0,
        totalIncome: 0,
        totalExpenses: 0,
        percentage: -1
      });
    }
  }

})(budgetController, UIController);

// call the init function from the app controller.
controller.init();

