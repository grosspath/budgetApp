// Budget Controller
let budgetController = (function() {

  let Expense = function(id, desc, value) {
    this.id = id;
    this.desc = desc;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totalIncome) {

      if (totalIncome > 0) {
        this.percentage = Math.round((this.value / totalIncome) * 100);
      } else {
        this.percentage = -1;
      }
  };

  Expense.prototype.getPercentage = function() {

    return this.percentage;
  };

  let Income = function(id, desc, value) {
    this.id = id;
    this.desc = desc;
    this.value = value;
  };

  let calculateTotal = function(type) {
    let sum = 0;
    data.allItems[type].forEach(function(curr) {
      sum += curr.value;
    });
    data.totals[type] = sum;
  };

  let data = {
    allItems: {
      expense: [],
      income: []
    },
    totals: {
      expense: 0,
      income: 0
    },
    budget: 0,
    percentage: -1
  };

  return {
    addItem: function(type, des, val) {
      let newItem, ID;

      // Create new ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      // Create new item based on type inc or exp
      if (type === 'expense') {
        newItem =  new Expense(ID, des, val);
      } else if (type === 'income') {
        newItem = new Income(ID, des, val)
      }

      // Push it into our data structure
      data.allItems[type].push(newItem);

      // Return the new element
      return newItem;

  },

  deleteItem: function(type, id) {
    let ids, index;

    ids = data.allItems[type].map(function(curr) {
      return curr.id;
    });

    index = ids.indexOf(id);

    if (index !== -1) {
      data.allItems[type].splice(index, 1);
    }
  },

  calculateBudget: function() {

    // Calculate total income and expenses
    calculateTotal('expense');
    calculateTotal('income');

    // Calculate budget: income - expenses

    data.budget = data.totals.income - data.totals.expense;

    // Calculate the percentage of income that we spent
    if (data.totals.income > 0) {
      data.percentage = Math.round((data.totals.expense / data.totals.income) * 100);
    } else {
      data.percentage = -1;
    }
  },

  calculatePercentages: function() {

    data.allItems.expense.forEach(function(curr) {
      curr.calcPercentage(data.totals.income);
    });
  },

  getPercentages: function() {

    let allPercentages = data.allItems.expense.map(function(curr) {
      return curr.getPercentage();
    });
    return allPercentages;

  },

  getBudget: function() {
    return {
      budget: data.budget,
      totalInc: data.totals.income,
      totalExp: data.totals.expense,
      percentage: data.percentage
    }
  }
  }

})();


// UI Controller
let UIController = (function() {

  let DOMstrings = {
    inputType: '.add__type',
    inputDescripton: '.add__description',
    inputValue: '.add__value',
    inputBtn:'.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expenseLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
  };

    let formatNumber = function(number, type) {
      let numSplit, int, dec, sign;

      number = Math.abs(number);
      number = number.toFixed(2);
      numSplit = number.split('.');
      int = numSplit[0];
      dec = numSplit[1];
      if (int.length > 3) {
        int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
      }
      ;
      return (type === 'expense' ? '-': '+') + ' ' + int + '.' + dec;
    };

  let nodeListForEach = function(list, callback) {
    for (let i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    getInput: function() {
      return {
        type: document.querySelector(DOMstrings.inputType).value, // Will be inc or exp
        desc: document.querySelector(DOMstrings.inputDescripton).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      }
    },

    addListItem: function(obj, type) {
      let html, newHtml, element;

      // Create HTML string with placeholder text

      if (type === 'income') {
        element = DOMstrings.incomeContainer;

        html =  '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
    } else if (type === 'expense') {
        element = DOMstrings.expensesContainer;

          html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
    }

      // Replace the placeholder with actual data

      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.desc);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

      // Insert the HTML into the DOM

      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);


    },

    deleteListItem: function(selectorID) {

      let el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);

    },

    clearFields: function() {
      let fields, fieldsArr;

      fields = document.querySelectorAll(DOMstrings.inputDescripton + ',' + DOMstrings.inputValue);

      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach(function(current, index, array) {
        current.value = "";
      });

      fieldsArr[0].focus();
    },

    displayBudget: function(obj) {
      let type;

      obj.budget > 0 ? type = 'income' : type = 'expense';

      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'income');
      document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'expense');


      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = '---';
      }


    },

    displayPercentages: function(percentages) {

      let fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

      nodeListForEach(fields, function(current, index) {
        if (percentages[index] > 0) {
        current.textContent = percentages[index] + '%';
        } else {
          current.textContent = "---";
        }
      });
    },

    displayMonth: function() {
      let now, year, month, months;

      months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September',
                'October', 'November', 'December'];
      now = new Date();
      month = now.getMonth();
      year = now.getFullYear();
      document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
    },

    changeType: function() {

      let fields = document.querySelectorAll(
        DOMstrings.inputType + ',' +
        DOMstrings.inputDescripton + ',' +
        DOMstrings.inputValue);

      nodeListForEach(fields, function(curr) {
        curr.classList.toggle('red-focus');
      });

      document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
    },

    getDOMstrings: function() {
      return DOMstrings;
    }
  };

})();


// Global App Controller
let controller = (function(budgetCtrl, UICtrl) {

  let setupEventListeners = function () {

    let DOM = UICtrl.getDOMstrings();
    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    document.addEventListener('keypress', function(evt) {

      if (evt.keyCode === 13 || evt.which === 13) {
        ctrlAddItem();
      }

    });
    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
  };


  let updateBudget = function() {
    let budget;
        // 1. Calculate the budget

        budgetCtrl.calculateBudget();

        // 2. Return the budget

        budget = budgetCtrl.getBudget();

        // 3. Display budget to UI
        UICtrl.displayBudget(budget);
      };

let updatePercentages = function() {

  // 1. Calculate updatePercentages

  budgetCtrl.calculatePercentages();

  // 2. Read percentages from the budget Controller

  let percentages = budgetCtrl.getPercentages();

  // 3. Update the UI with the new allPercentages

  UICtrl.displayPercentages(percentages);


}

  let ctrlAddItem = function() {
    let input, newItem;

    // 1. Get the field input data

    input = UICtrl.getInput();

    if (input.desc !== "" && !isNaN(input.value) && input.value > 0 ) {
      // 2. Add the item to the budget Controller

      newItem = budgetCtrl.addItem(input.type, input.desc, input.value);

      // 3. Add the new item to the UI

      UICtrl.addListItem(newItem, input.type);

      // 4. Clear the fieldsArr

      UICtrl.clearFields();

      // 5. Calculate and update budget__title

      updateBudget();

      // 6. Calculate and update updatePercentages

      updatePercentages();

    }
  };

  let ctrlDeleteItem = function(evt) {
    let itemID, splitID, type, ID;

    itemID = evt.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemID) {

      // inc-1
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // 1. delete item from data structure

      budgetCtrl.deleteItem(type, ID);

      // 2. delete item from UI

      UICtrl.deleteListItem(itemID);

      // 3. update and show new budget

      updateBudget();

      // 4. Calculate and update updatePercentages

      updatePercentages();
    }

  };

    return {
      init: function() {
        UICtrl.displayMonth();
        UICtrl.displayBudget({
          budget: 0,
          totalInc: 0,
          totalExp: 0,
          percentage: -1
        })
        setupEventListeners();
      }
    }

  })(budgetController, UIController);

  controller.init();
