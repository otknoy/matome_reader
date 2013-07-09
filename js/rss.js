var listItems = [];

// rdf のリストを読み込んで RSS を取得し、
// 新着記事のタイトル、URI、日時を listItems に保存
// 全ての記事の取得し終わったら、listview を生成
$(function() {
    var filename = 'data/2ch_matome.json';

    $.getJSON(filename).done(function(data) {
	var loadMethods = [];
	
        for (var i = 0; i < data.length; i++) {
	    var loadMethod = loadArticles(data[i].uri);
            loadMethods.push(loadMethod);
        }

        $.when.apply(null, loadMethods).done(function() {
            console.log('all done');

	    listItems.sort(function(a, b){
		return b['date'] - a['date'];
	    });
	    
	    createListView(listItems);

	    // for (var i = 0; i < listItems.length; i++) {
	    // 	var d = new Date(listItems[i]['date']);
	    // 	console.log(d);
	    // }
        });
    });
});


function loadArticles(uri) {
    var d = $.Deferred();

    var xhr = new XMLHttpRequest({mozSystem: true});
    xhr.onload = function() {
	var items = xmlToItems(this.responseText);
	for (var i = 0; i < items.length; i++) {
	    listItems.push(items[i]);
	}

	console.log(items.length);
	d.resolve(items);
    };

    xhr.onerror = function() {
	console.log(error);
	d.reject('error');
    };
    xhr.open("GET", uri);
    xhr.responseType = "xml";
    xhr.send();

    return d.promise();
}

function xmlToItems(xml) {
    var $xml = $($.parseXML(xml));
    var $item = $xml.find('item');

    var items = $item.map(function() {
	var title = $(this).children('title').text();
	var link = $(this).children('link').text();
	
	var w3cdtf = $(this).children('dc\\:date').text();
	var date = (new Date()).setW3CDTF(w3cdtf);
		
	return {title: title, link: link, date: date};
    });

    return items;
}

function createListView(items) {
    for (var i = 0; i < items.length; i++) {
	var $a = $('<a>').attr({
	    // 'href': items[i].link,
	    'data-transition': 'slide'
	}).text(items[i].title);
	$a.bind('click', function() { console.log(listItems.length);});
	var $li = $('<li>').append($a);
	
	$('#articles').append($li);
    }
    $('#articles').listview('refresh');
}

