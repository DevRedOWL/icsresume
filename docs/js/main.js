var ThisRest; // Ну на всякий случай сохраним, че нам
var ServerUrl = "https://icsresume.herokuapp.com/invoices";

// При загрузке документа
$(document).ready(function() {
  $('#sended').hide();
  $('#unsended').hide();
  GotIt();
});

// Метод получения
function GotIt() {
  $('#ElementsList tr').slice(1).remove(); // Очищаем таблицу
  $.get(ServerUrl, onAjaxSuccess);
}

// Метод, выполняющийся при успехе GET запроса
function onAjaxSuccess(data) {
  ThisRest = data; // Запоминаем текущее состояние
  console.log(ThisRest); // Выводим в консоль для отладки
  // Выводим все элементы в таблицу
  $.each(ThisRest, function(index, val){
      newline = "<tr><th>" + val.date_created + "</th><th>" + val.number + "</th><th>" + val.date_due
          + "</th><th>" + val.comment + "</th><th class ='ds'><i class='fas fa-trash-alt' id='" + val.id +
          + "' onclick = 'RemoveItem(\""+ val.id +"\")' > </i></th></tr> "
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
  // Если все поля, кроме комментария заполнены
  if (num != 0 && sup != 0 && inv != 0)
  {
    // Создаем пост запрос на основании аргументов
    $.post(ServerUrl, { comment: com, date_created: dat, date_due: inv, date_supply: sup, number: num  });
    // Показываем уведомление о добавлении
    $('#sended').fadeIn('fast'); setTimeout(function() {  $('#sended').fadeOut('slow'); }, 3000); $('#unsended').hide(); // .show
    // Добавляем строку в таблицу
    newline = "<tr><th>" + dat + "</th><th>" + num + "</th><th>" + inv + "</th><th>" + com + "</th><th class ='ds'><i class='fas fa-trash-alt' data=''></i></th></tr>"
    $('#ElementsList').append(newline);
  }
  // Если поля не заполнены
  else
  {
    $('#unsended').fadeIn('fast'); setTimeout(function() {  $('#unsended').fadeOut('slow'); }, 3000);
    $('#sended').hide(); //alert("Все поля должны быть заполнены");
  }
}

// Метод удаления
function RemoveItem(objectid) {
    $.ajax({
        url: ServerUrl + "/" + objectid,
        type: 'DELETE',
        success: function (result) {
            $('#' + objectid).remove;
        }
    });
}
