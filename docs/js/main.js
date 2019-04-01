var ThisRest; // Ну на всякий случай сохраним, че нам
var ServerUrl = "https://icsresume.herokuapp.com/invoices";

// Готовность документа к работе
$(document).ready(function () {
    ShowMessage("none");
    GotIt();
});

// Метод отображения сообщений
function ShowMessage(type) {
    $('#sended').hide(); $('#edited').hide(); $('#removed').hide(); $('#unsended').hide(); $('#exist').hide();
    if (type != "none") {
        $(type).fadeIn('fast');
        setTimeout(function () { $(type).fadeOut('slow'); }, 2000);
    }
}

// Метод генерации строки таблицы
function NewLine(thisid, name, date_due, date_sup, comment, created) {
    return "<tr id='" + thisid + "'><th>" + date_sup + "</th><th>" + name + "</th><th>"
        + date_due + "</th><th>" + comment + "</th>" + "<th class ='options'>"
        + "<i class='del fas fa-trash-alt' onclick='RemoveItem(\"" + thisid + "\")'> </i> "
        + "<i class='edit fas fa-edit' onclick='EditItem(\"" + thisid + "\")'> </i>"
        + "<span class='lastedit badge'>Изменен:\n" + created + "</span> </th>" + "</tr>"
}

// Метод получения списка
function GotIt() {
    $('#ElementsList tr').slice(1).remove(); // Очищаем таблицу
    $.get(ServerUrl, onAjaxSuccess);
}

// Метод, выполняющийся при успехе GET запроса с пол
function onAjaxSuccess(data) {
    ThisRest = data; // Запоминаем текущее состояние
    console.log(ThisRest); // Выводим в консоль для отладки
    // Выводим все элементы в таблицу
    $.each(ThisRest, function (index, val) {
        $('#ElementsList').append(NewLine(val.id, val.number, val.date_due, val.date_supply, val.comment, val.date_created));
    });
}

// Метод добавления элемента
function PostThat() {
    // Упрощаем использование значений полей
    var num = document.getElementById('Number').value;
    var sup = new Date(document.getElementById('Supply').value).toLocaleDateString();
    var inv = new Date(document.getElementById('Invoice').value).toLocaleDateString();
    var com = document.getElementById('Comment').value;
    datte = new Date(); var dat = datte.toLocaleDateString();
    var thisid = CryptoJS.MD5(num + sup + inv + com).toString(); // Преобразуем ид в md5
    // Если все поля, кроме комментария заполнены
    if (num != 0 && sup != "Invalid Date" && inv != "Invalid Date") {
        // Создаем пост запрос на основании аргументов    
        $.post(ServerUrl, { id: thisid, comment: com, date_created: dat, date_due: inv, date_supply: sup, number: num })
            .done(function() // Если постинг прошел успешно
            {              
                ShowMessage('#sended'); // Показываем уведомление о добавлении
                // Добавляем строку в таблицу             
                $('#ElementsList').append(NewLine(thisid, num, inv, sup, com, dat));
                console.log('Накладная #' + thisid + ' успешно добавлена');
            })
            .fail(function() // Если произошла ошибка
            {
                ShowMessage('#exist'); // Показываем уведомление о существовании
                console.log("Накладная с такими же параметрами уже существует");
            });    
    }
    // Если поля не заполнены
    else {
        ShowMessage('#unsended'); // Показываем уведомление об ошибке      
    }
}

// Метод удаления элемента
function RemoveItem(objectid) {
    $.ajax({
        url: ServerUrl + "/" + objectid,
        type: 'DELETE',
        success: function () {
            $('#' + objectid).remove();
            ShowMessage('#removed'); // Показываем уведомление об удалении
            console.log('Накладная #' + objectid + ' успешно удалена');
        }
    });
}

// Метод редактирования элемента
function EditItem(objectid) {
    $.get(ServerUrl + "/" + objectid, GetFields); // Получаем конкретный элемент
}

// Метод вывода полей ввода
function GetFields(data) {
    var ds = data.date_supply.split('.'); var dd = data.date_due.split('.'); // Для преобразования в дату
    newline = "<tr id='" + data.id + "'>"
        + "<th><input id='" + data.id + "_SUP' class='form-control' type='date' value='" + ds[2] + "-" + ds[1] + "-" + ds[0] + "'> </input></th>"
        + "<th><input id='" + data.id + "_NUM' class='form-control' type='text' value='" + data.number + "'> </input></th>"
        + "<th><input id='" + data.id + "_INV' class='form-control' type='date' value='" + dd[2] + "-" + dd[1] + "-" + dd[0] + "'> </input></th>"
        + "<th><textarea id='" + data.id + "_COM' class='form-control' rows='3'>" + data.comment + "</textarea></th> "
        + "<th class ='options'>"
        + "<i class='save fas fa-save' onclick='OnSaveChanges(\"" + data.id + "\")'> </i>"
        + "</th>" + "</tr>"; 
    $("#"+data.id).replaceWith(newline); // Заменяем строчку
    // Свойства: id date_supply number date_due comment date_created 
}

// Метод сохранения изменений
function OnSaveChanges(objectid) {
    var sup = new Date(document.getElementById(objectid + "_SUP").value).toLocaleDateString();
    var inv = new Date(document.getElementById(objectid + "_INV").value).toLocaleDateString();
    var com = document.getElementById(objectid + "_COM").value;
    var num = document.getElementById(objectid + "_NUM").value;
    datte = new Date(); var dat = datte.toLocaleDateString();
    if (num != 0 && sup != "Invalid Date" && inv != "Invalid Date") { 
        // Формируем PUT запрос
        $.ajax({
            url: ServerUrl + "/" + objectid,
            type: 'PUT', 
            data: { comment: com, date_created: dat, date_due: inv, date_supply: sup, number: num },
            success: function () {
                ShowMessage('#edited'); // Показываем уведомление об удалении
                console.log('Накладная #' + objectid + ' успешно изменена');
            }
        });
        $("#" + objectid).replaceWith(NewLine(objectid, num, inv, sup, com, dat)); // Заменяем строчку
    }
    else {
        ShowMessage('#unsended'); // Показываем уведомление об ошибке
    }
}