// Event Listeners

document.getElementById('book-form').addEventListener('submit', function(e) {
    const ui = new UI();

    if (ui.title.value === '' || ui.author.value === '' || (ui.isbn.value === '' || isNaN (Number(ui.isbn.value)))) {
        ui.showAlert('Please fill all fields with required information!', 'error');
        e.preventDefault();
        return;
    }

    ui.addBookToList();
    ui.clearInputValues();
    ui.showAlert('Book was successfully added!', 'success');
    e.preventDefault();
})

document.addEventListener('DOMContentLoaded', function(e) {
    const sessionManager = new SessionManager();

    sessionManager.loadBooks();
});

// Search for books via OpenLibrary API

const searchBox = document.querySelector(".search-box")

searchBox.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
        const search = searchBox.value;
        const query = search.replace(/\s/g, '+').toLowerCase()
        fetchBookData(query)
    } else return 
})

const fetchBookData = async (query) => {
    const ui = new UI();

    const result = await fetch(`https://openlibrary.org/search.json?q=${query}`)
    const data = await result.json();

    if (data.numFound === 0) {
        ui.showAlert("Could not find the book!", "error");
        console.error("Data returned empty!");
        searchBox.value = "";
    } else {
        ui.showAlert('Retrieved data from server!', 'search');
        return displayBookInfo(data);
    }
}

const displayBookInfo = (data) => {
    document.getElementById('title').value = data.docs[0].title;
    document.getElementById('author').value = data.docs[0].author_name[0];
    document.getElementById('isbn').value = data.docs[0].isbn[0];
    searchBox.value = "";
}

// Book Class

class Book {
    constructor(title, author, isbn) {
        this.title = title;
        this.author = author;
        this.isbn = isbn;
    }
}

// UI Class

class UI {
    constructor() {
        this.title = document.getElementById('title');
        this.author = document.getElementById('author');
        this.isbn = document.getElementById('isbn');
        this.bookList = document.getElementById('book-list');
        this.container = document.querySelector('.container');
        this.bookForm = document.getElementById('book-form');
        this.body = document.body;
        this.footer = document.footer;
    }

    addBookToList(savedBook = null) {
        const book = Boolean(savedBook) ? savedBook : new Book (this.title.value, this.author.value, this.isbn.value);

        const newBookEntry = document.createElement('tr');
        newBookEntry.innerHTML = `
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.isbn}</td>
        `;
    
        const removeButtonEntry = document.createElement('td');
        const removeButton = document.createElement('button');
        removeButton.id = 'remove-book';
        removeButton.className = 'btn btn-remove';
        removeButton.innerText = 'Remove';
    
        removeButton.addEventListener('click', function(e) {
            const ui = new UI();
            ui.removeBookFromList(e.target);
            ui.showAlert('Book was successfully removed!', 'removal');
        });
    
        removeButtonEntry.appendChild(removeButton);
        newBookEntry.appendChild(removeButtonEntry);
    
        this.bookList.appendChild(newBookEntry);
    
        if (!Boolean(savedBook)) {
            const sessionManager = new SessionManager();
    
            sessionManager.addBook(book);
        }
    }

    removeBookFromList(target) {
        if (target.id === 'remove-book') {
            target.parentElement.parentElement.remove();
    
            const sessionManager = new SessionManager();
    
            sessionManager.removeBook(target.parentElement.previousElementSibling.innerText);
        }
    }

    clearInputValues () {
        this.title.value = '';
        this.author.value = '';
        this.isbn.value = '';
    }

    showAlert(message, className) {
        const alert = document.createElement('div');
        alert.className = `alert ${className}`;
        alert.textContent = message;
    
        this.container.insertBefore(alert, this.footer);
    
        setTimeout(function() {
            const ui = new UI()
            ui.container.removeChild(alert)
        }, 2000);
    }

}

// SessionManager Class

class SessionManager {
    constructor() {
        this.books = Boolean(localStorage.getItem('books')) ? JSON.parse(localStorage.getItem('books')) : [];
    }

    addBook(book) {
        this.books.push(book);

        localStorage.setItem('books', JSON.stringify(this.books));
    }

    removeBook(isbn) {
        const book = this.books.find(function(book) {
            return book.isbn === isbn;
        });
    
        if (Boolean(book)) {
            this.books.splice(this.books.indexOf(book), 1);
            localStorage.setItem('books', JSON.stringify(this.books));
        }
    }

    loadBooks() {
        this.books.forEach(function(book) {
            const ui = new UI();
    
            ui.addBookToList(book);
        })
    }
}