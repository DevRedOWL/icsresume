var ThisRest; // Ну на всякий случай сохраним, че нам
var ServerUrl = "https://icsresume.herokuapp.com/invoices";

// При загрузке документа
$(document).ready(function () {
    ShowMessage("none");
    GotIt();
});

// Метод получения
function GotIt() {
    $('#ElementsList tr').slice(1).remove(); // Очищаем таблицу
    $.get(ServerUrl, onAjaxSuccess);
}

function ShowMessage(type) {
    $('#sended').hide(); $('#removed').hide(); $('#unsended').hide(); $('#exist').hide(); 
    if (type != "none") {
        $(type).fadeIn('fast');
        setTimeout(function () { $(type).fadeOut('slow'); }, 3000);  
    }       
}

// Метод, выполняющийся при успехе GET запроса
function onAjaxSuccess(data) {
    ThisRest = data; // Запоминаем текущее состояние
    console.log(ThisRest); // Выводим в консоль для отладки
    // Выводим все элементы в таблицу
    $.each(ThisRest, function (index, val) {
        newline = "<tr id='" + val.id + "'><th>" + val.date_created + "</th><th>" + val.number + "</th><th>"
            + val.date_due + "</th><th>" + val.comment + "</th>" + "<th class ='options'>" 
            + "<i class='del fas fa-trash-alt' onclick='RemoveItem(\"" + val.id + "\")'> </i> " 
            + "<i class='edit fas fa-edit' onclick='EditItem(\"" + val.id + "\")'> </i>" 
            + "</th>" + "</tr>"
        $('#ElementsList').append(newline);
    });
}

// Метод добавления
function PostThat() {
    // Упрощаем использование значений полей
    var num = document.getElementById('Number').value;
    var sup = document.getElementById('Supply').value;
    var inv = document.getElementById('Invoice').value;
    var com = document.getElementById('Comment').value;
    datte = new Date(); var dat = datte.toLocaleDateString();
    var thisid = CryptoJS.MD5(num + sup + inv + com).toString(); // Преобразуем ид в md5
    // Если все поля, кроме комментария заполнены
    if (num != 0 && sup != 0 && inv != 0) {
        // Создаем пост запрос на основании аргументов    
        $.post(ServerUrl, { id: thisid, comment: com, date_created: dat, date_due: inv, date_supply: sup, number: num })
            .done(function() // Если постинг прошел успешно
            {              
                ShowMessage('#sended'); // Показываем уведомление о добавлении
                // Добавляем строку в таблицу
                newline = "<tr id='" + thisid + "'><th>" + dat + "</th><th>" + num + "</th><th>"
                    + inv + "</th><th>" + com + "</th>" + "<th class ='options'>" 
                    + "<i class='del fas fa-trash-alt' onclick='RemoveItem(\"" + thisid + "\")'> </i> "
                    + "<i class='edit fas fa-edit' onclick='EditItem(\"" + thisid + "\")'> </i>"
                    + "</th>" + "</tr>"
                $('#ElementsList').append(newline); console.log('Накадная #' + thisid + ' успешно добавлена');
            })
            .fail(function() // Если произошла ошибка
            {
                ShowMessage('#exist'); // Показываем уведомление о существовании
                console.log("Накладная с такими же параметрами уже существует");
            });    
    }
    // Если поля не заполнены
    else {
        ShowMessage('#unsended'); // Показываем уведомление о добавлении      
    }
}

// Метод удаления
function RemoveItem(objectid) {
    $.ajax({
        url: ServerUrl + "/" + objectid,
        type: 'DELETE',
        success: function () {
            $('#' + objectid).remove();
            ShowMessage('#removed'); // Показываем уведомление об удалении
            console.log('Накадная #' + objectid + ' успешно удалена');
        }
    });
}
