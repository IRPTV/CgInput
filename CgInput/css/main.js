$(function () {
    var showDeleted = $("#show-deleted").is(':checked');
    $("#show-deleted").change(function () {
        showDeleted = $(this).is(':checked');
    });
    $(window).scroll(function () {
        if ($(window).scrollTop() > 80) {
            $("#lookups").addClass('fixed');
            $("#main").css({ 'padding-top': '130px' });
        } else {
            $("#lookups").removeClass('fixed');
            $("#main").css({ 'padding-top': '0' });
        }
    });
    function initColorpicker() {
        $(".colorpicker").each(function () {
            var $colorpicker = $(this);
            $colorpicker.delegate('a', 'click', function (e) {
                $colorpicker.find('a').each(function () {
                    if ($(this).hasClass('selected'))
                        $(this).removeClass('selected');
                });
                $(this).addClass('selected');
                e.preventDefault();
            });
        });
    }
    initColorpicker();
    $("[data-toggle=tooltip]").tooltip();
    $(".colorpicker").each(function () {
        $(this).find("a").each(function () {
            $(this).tooltip({ title: $(this).text() });
        });
    });
    $("#datepicker").datepicker({ format: 'dd/mm/yyyy', todayHighlight: true }).on('changeDate', function () {
        prepareLookup();
    });
    $("#ddatepicker").datepicker({ format: 'dd/mm/yyyy', todayHighlight: true });
	
    $("#add-item").on('submit', function () {
        insertItem();
        return false;
    });
    function parseDate(date) {
        parts = date.split('/');
        parsedDate = [parseInt(parts[2]), parseInt(parts[1]), parseInt(parts[0])];
        return parsedDate;
    }
    var $list = $(".table-items tbody");
    var $itemTable = $(".table-item");
    var $lookupTable = $(".table-lookup");
    var $crawl = $("#crawl");
    var $time = $("#times");
    var $preview = $("#preview");
    var ordering = '<div class="ordering"><a href="#" class="up pull-right"><i class="icon-chevron-up"></i></a><a href="#" class="down pull-left"><i class="icon-chevron-down"></i></a></div>';
    var fOrdering = '<div class="ordering"><a href="#" class="down pull-left"><i class="icon-chevron-down"></i></a></div>';
    var lOrdering = '<div class="ordering"><a href="#" class="up pull-right"><i class="icon-chevron-up"></i></a></div>';





    $list.delegate(".insert-after", 'click', function (e) {
        $("html, body").animate({ scrollTop: 0 }, 700, 'linear');
        var id = $(this).parent().parent().find(".priority").text();
        $("#cancel-insert").fadeIn(400);
        $("#text-label").find("span").fadeIn(400).find("span").text(id);
        $itemTable.find("#text").focus();
        $itemTable.find("#cancel-insert").attr('data-id', id);
        e.preventDefault();
    });
    $itemTable.delegate("#cancel-insert > a", 'click', function (e) {
        removeAddAfterElements();
        e.preventDefault();
    });
    function removeAddAfterElements() {
        $itemTable.find("#text").val('');
        $("#text-label").find("span").fadeOut(400, function () {
            $(this).find("span").text('');
        });
        $itemTable.find("#cancel-insert").attr('data-id', '').fadeOut(400);
    }

    function timeSelect() {
        $.ajax({
            type: "POST",
            url: "/wc.asmx/Time_Select",
            // data: "{ Lang:" + OptionId + " }",
            contentType: "application/json; charset=utf-8",
            success: function (times) {
				$obj = $("#times");
                $obj.empty();
                $.each(times.d, function () {
                    $obj.append('<option value="' + this['Id'] + '">' + this['Title'] + '</option>');
                });
                $obj.attr('disabled', false);
				
				$obj = $("#dtimes");
                $obj.empty();
                $.each(times.d, function () {
                    $obj.append('<option value="' + this['Id'] + '">' + this['Title'] + '</option>');
                });
                $obj.attr('disabled', false);
            }
        });
    }
    timeSelect($time);
    var d = new Date();
    var day = d.getDate();
    var month = d.getMonth() + 1;
    if (month < 10) month = '0' + month;
    var year = d.getFullYear();
    var formattedDate = day + '/' + month + '/' + year;
    if ($("#datepicker").val() == '') {
        $("#datepicker").val(formattedDate);
    }

    function loadItems(Crawl_Id, Times_Id, Date, scrollid) {
        $list.empty();
        newDate = parseDate(Date);
        $.ajax({
            type: "POST",
            url: "/wc.asmx/Items_Select",
            data: "{Crawl_Id: " + Crawl_Id + ", Times_Id: " + Times_Id + ", Year: " + newDate[0] + ", Month: " + newDate[1] + ", Day: " + newDate[2] + ", Deleted: " + showDeleted + "}",
            contentType: "application/json; charset=utf-8",
            success: function (items) {
                var data = items.d;
                $list.empty();
                if (data.length == 0) $("#delete-all").addClass('disabled'); else $("#delete-all").removeClass('disabled');
                for (i = 0; i < data.length; i++) {
                    var trClass = (data[i].DELETED == true) ? ' class="error"' : '';
                    var text = (data[i].TEXT == "^^") ? '<span class="circle">&#8226;</span>' : data[i].TEXT.replace(/\$\$/g, '&quot;');
                    var editButton = (data[i].TEXT == "^^") ? '' : '<a href="#" class="edit-item"><i class="icon-edit"></i></a>';
                    var optionButtons = (data[i].DELETED == false) ? '<td class="span1"><a href="#" class="remove-item"><i class="icon-remove"></i></a></td><td class="span1">' + editButton + '</td>' : '<td></td><td></td>';
                    $list.append('<tr data-id="' + data[i].ID + '"' + trClass + '><td class="span1"><a href="#" class="insert-after"><i class="icon-plus"></i></a></td><td class="span1 priority">' + data[i].PRIORITY + '</td><td class="text" style="color: ' + data[i].COLOR + '">' + text + '</td>' + optionButtons + '<td class="span1"><a href="#" class="show-item-info"><i class="icon-info-sign"></i></a></td></tr>');
                }
                //added 2013-11-18 move scroll to bottom of page
                if ($("#show-pageend").is(':checked')) {
                    $("html, body").animate({ scrollTop: $(document).height() - $(window).height() });
                }
                //alert(scrollid);
                if (scrollid > 0) {
                    $('html, body').animate({
                        scrollTop: $("tr[data-id=" + scrollid + "]").offset().top - 140
                    }, 1000);
                }
                getPublishInfo(Times_Id, Date);
            }, error: function () {
                $("#delete-all").addClass('disabled');
            }
        });
    }

    $("#delete-all").click(function (e) {
        if (!$(this).hasClass('disabled')) {
            if (confirm('آیا مطمئن هستید همه موارد حذف شوند؟')) {
                if (!$("#datepicker").val().length || $("#language").val() < 1 || !$crawl.val()) {
                    if (!$("#datepicker").val().length)
                        raiseError($("#datepicker"));
                    if ($("#language").val() < 1)
                        raiseError($("#language"));
                    if (!$crawl.val())
                        raiseError($crawl);
                } else {
                    var Crawl_Id = parseInt($crawl.val());
                    var Times_Id = parseInt($("#times").val());
                    var Crawl_date = $("#datepicker").val();
                    deleteAll(Crawl_Id, Times_Id, Crawl_date);
                }
            }
        }
        e.preventDefault();
    })

    function deleteAll(Crawl_Id, Times_Id, Crawl_date) {
        newDate = parseDate(Crawl_date);
        $.ajax({
            type: "POST",
            url: "/wc.asmx/Delete_All",
            data: "{Crawl_Id: " + Crawl_Id + ", Times_Id: " + Times_Id + ", Year: " + newDate[0] + ", Month: " + newDate[1] + ", Day: " + newDate[2] + "}",
            contentType: "application/json; charset=utf-8",
            success: function (items) {
                $list.empty();
            }
        });
    }

    function getPublishInfo(Times_Id, Crawl_date) {
        newDate = parseDate(Crawl_date);
        $.ajax({
            type: "POST",
            url: "/wc.asmx/Get_Info",
            data: "{Times_Id: " + Times_Id + ", Year: " + newDate[0] + ", Month: " + newDate[1] + ", Day: " + newDate[2] + ", LangId: " + $("#language").val() + "}",
            contentType: "application/json; charset=utf-8",
            success: function (data) {
                $("#last-publish").text(data.d.DATETIME);
                $("#last-publish-by").text(data.d.USERNAME);
                $("#play-time").text(secondsTimeSpanToHMS(data.d.TIME));
                if (data.d.LOCK) {
                    $("#insert").hide();
					$("#text").attr('disabled', 'disabled');
                    $("#publish").hide();
                    $(".remove-item").hide();
                    $(".icon-edit").hide();
                    $("#delete-all").hide();
                } else {
                    $("#insert").show();
					$("#text").removeAttr('disabled');
                    $("#publish").show();
                    $(".remove-item").show();
                    $(".icon-edit").show();
                    $("#delete-all").show();
                }
            }
        });
    }

    $("#reload-crawl").click(function (e) {
        updateCrawl();
        e.preventDefault();
    });

    function prepareLookup(scrollid) {
        if (!$("#datepicker").val().length || $("#language").val() < 1 || !$crawl.val()) {
            if (!$("#datepicker").val().length)
                raiseError($("#datepicker"));
            if ($("#language").val() < 1)
                raiseError($("#language"));
            if (!$crawl.val())
                raiseError($crawl);
        } else {
            var Crawl_Id = parseInt($crawl.val());
            var Times_Id = parseInt($("#times").val());
            var Crawl_date = $("#datepicker").val();
            loadItems(Crawl_Id, Times_Id, Crawl_date, scrollid);
            //loadItems(Crawl_Id, Times_Id, Crawl_date);

        }
    }

    $dmodal = $("#duplicate-modal");
    function duplicateItem(params) {
        $.ajax({
            type: "POST",
            url: "/wc.asmx/Items_Copy",
            data: "{Crawl_Id: " + params.Crawl_Id + ", Times_Id: " + params.Times_Id + ", Year: " + params.Year + ", Month: " + params.Month + ", Day: " + params.Day + ", DestCrawl_Id: " + params.DestCrawl_Id + ", DestTimes_Id: " + params.DestTimes_Id + ", DestYear: " + params.DestYear + ", DestMonth: " + params.DestMonth + ", DestDay: " + params.DestDay + ", DestLang: " + params.DestLang + "}",
            contentType: "application/json; charset=utf-8",
            success: function (items) {
                alert('آیتم با موفقیت کپی شد.');
                $dmodal.modal('toggle');
            }, errpr: function () {
                alert('Error!');
            }
        });
    }

    $("body").on('hidden', '.modal', function () {
        $(this).removeData('modal');
    });

    $dmodal = $("#duplicate-modal");
    $("#duplicate").click(function (event) {
        $dmodal.modal('show');
    });
    $dmodal.on('shown', function () {
        $("#ddatepicker").val(formattedDate);
        // timeSelect($("#dtimes"));
        if ($("#language").val() > 0) {
            // loadCrawls($("#language").val(), $("#dcrawl"));
        }
        // $("#language").change(function () {
            // var OptionId = parseInt($(this).find("option:selected").val());
            // if (OptionId != 0) {
                // loadCrawls(OptionId, $("#dcrawl"));
            // }
        // });
        $("#ssdate").val($("#datepicker").val());
        $("#sdate").val($("#datepicker").val());
        $("#sslang").val($("#userlang").val());
        $("#slang").val($("#language").val());
        $("#sscrawl").val($crawl.find("option:selected").text());
        $("#scrawl").val($crawl.val());
        $("#sstimes").val($time.find("option:selected").text());
        $("#stimes").val($time.val());
    });
    $dmodal.delegate("#cancel-duplicate", 'click', function (event) {
        $dmodal.modal('toggle');
        event.preventDefault();
    });
    $dmodal.delegate("#do-duplicate", 'click', function (event) {
        var sourceDate = parseDate($("#datepicker").val());
        var destDate = parseDate($("#ddatepicker").val());
        var params = {
            Crawl_Id: $crawl.val()
			, Times_Id: $time.val()
			, Year: sourceDate[0]
			, Month: sourceDate[1]
			, Day: sourceDate[2]
			, DestCrawl_Id: $("#dcrawl").val()
			, DestTimes_Id: $("#dtimes").val()
			, DestYear: destDate[0]
			, DestMonth: destDate[1]
			, DestDay: destDate[2]
			, DestLang: $("#language").val()
        }
        duplicateItem(params);
        event.preventDefault();
    });

    $lookupTable.find("select").change(function () {
        prepareLookup();
    });

    $("#loadlist").click(function (event) {
        prepareLookup();
        event.preventDefault();
    });

    $list.delegate("a.show-item-info", 'click', function (event) {
        event.preventDefault();
    });

    function loadCrawls(OptionId) {
        $.ajax({
            type: "POST",
            url: "/wc.asmx/Crwal_Select",
            data: "{ Lang:" + OptionId + " }",
            contentType: "application/json; charset=utf-8",
            success: function (crawls) {
                $obj = $("#crawl");
				$obj.empty();
                if ($obj.attr('data-type') == 'duplicate')
                    $obj.append('<option value="0"> - همه موارد - </option>');
                $.each(crawls.d, function () {
                    $obj.append('<option value="' + this['Value'] + '">' + this['Text'] + '</option>');
                });
                $obj.attr('disabled', false);
                
				$obj = $("#dcrawl");
				$obj.empty();
                if ($obj.attr('data-type') == 'duplicate')
                    $obj.append('<option value="0"> - همه موارد - </option>');
                $.each(crawls.d, function () {
                    $obj.append('<option value="' + this['Value'] + '">' + this['Text'] + '</option>');
                });
                $obj.attr('disabled', false);
                // lookupTimeOut = setTimeout(function () { prepareLookup(); }, 100);
            }
        });
    }

    if ($("#language").val() > 0) {
        loadCrawls($("#language").val(), $crawl);
    }
    $("#language").change(function () {
        // var OptionId = parseInt($(this).find("option:selected").val());
        var OptionId = parseInt($(this).val());
        if (OptionId != 0) {
            loadCrawls(OptionId, $crawl);
        }
    });

    $("#loadlist").click(function (event) {
        $lookupTable.find("input, select").each(function () {
            if (typeof ($(this).val()) == "undefined" || $(this).val() == "" || $(this).val() == null) {
                $(this).parent().parent().addClass("error");
            }
        });
        // console.log($("#crawl").val());
        event.preventDefault();
    });
    $("body").delegate("input, select", 'focusin', function () {
        $(this).parent().parent().removeClass("error");
    });

    function raiseError(obj) {
        obj.parent().parent().addClass("error");
        return false;
    }

    function reorderItems() {
        var o = 1;
        $list.find('tr').each(function () {
            $(this).find("td:first").text(o);
            o++;
        });
    }

    $list.delegate("a.remove-item", 'click', function (event) {
        var $anchor = $(this);
        var id = $anchor.parent().parent().attr('data-id');
        var order = $anchor.parent().parent().find('td:nth-child(2)').text();
        if (confirm('آیا مطمئن هستید مورد انتخاب شده (' + order + ') حذف گردد؟')) {
            $.ajax({
                type: "POST",
                url: "/wc.asmx/Items_Delete",
                data: '{Id: "' + id + '"}',
                contentType: "application/json; charset=utf-8",
                success: function (data) {
                    $anchor.parent().parent().fadeOut('slow').remove();
                    var interval = setTimeout(function () {
                        prepareLookup();
                    }, 100);
                }
            });
        }
        event.preventDefault();
    });

    function publish(Times_Id, Crawl_date) {
        // if (confirm('آیا مطمئن هستید مورد انتخاب شده منتشر شود؟')) {
        newDate = parseDate(Crawl_date);
        $.ajax({
            type: "POST",
            url: "/wc.asmx/Items_Publish",
            data: '{Times_Id: "' + Times_Id + '", Year: "' + newDate[0] + '", Month: "' + newDate[1] + '", Day: "' + newDate[2] + '", LangId: "' + $("#language").val() + '"}',
            contentType: "application/json; charset=utf-8",
            success: function (data) {
                alert('مورد با موفقیت منتشر شد.');
            }
        });
        // }
    }

    $lookupTable.delegate("#publish", 'click', function (event) {
        var Times_Id = parseInt($("#times").val());
        var Crawl_date = $("#datepicker").val();
        publish(Times_Id, Crawl_date);
        event.preventDefault();
    });

    function hexc(colorval) {
        var parts = colorval.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        delete (parts[0]);
        for (var i = 1; i <= 3; ++i) {
            parts[i] = parseInt(parts[i]).toString(16);
            if (parts[i].length == 1) parts[i] = '0' + parts[i];
        }
        var color = '#' + parts.join('');
        return color;
    }

    $list.delegate("a.edit-item", 'click', function (event) {
        var $anchor = $(this);
        var $parentRow = $(this).parent().parent();
        if (!$anchor.hasClass('iseditting')) {
            $anchor.addClass('iseditting');
            var id = $parentRow.attr('data-id');
            var order = $parentRow.find('td.priority').html();
            var text = $parentRow.find('td.text').html().replace(/"/g, "&quot;").replace(/\$\$/g, "&quot;");
            var color = hexc($parentRow.find('td.text').css('color'));
            var colors = {
                code: $parentRow.find('td.text').css('color')
					, black: (color == '#000000') ? ' selected' : ''
					, red: (color == '#ff0000') ? ' selected' : ''
            };
            $parentRow.find('td.priority').html('<input type="text" class="input-mini new-order" value="' + order + '" name="nord" />');
            $parentRow.find('td.text').html('<div class="form-inline"><span style="display:inline-block;position:relative;"><input type="text" class="input-xxlarge new-text" value="' + text + '" name="ntext" /><div class="colorpicker pull-left"><a href="#" class="black' + colors.black + '" data-color="#000000">مشکی (پیش فرض)</a><a href="#" class="red' + colors.red + '" data-color="#ff0000">قرمز</a></div></span><a href="#" class="btn btn-success finish-edit"><i class="icon-refresh icon-white"></i>&nbsp;اعمال تغییرات</a><a href="#" class="btn btn-danger cancel-edit">لغو</a></div>');
            initColorpicker();
            $parentRow.delegate("a.finish-edit", 'click', function (event) {
                params = {
                    ordering: $parentRow.find("input.new-order").val()
					, color: $parentRow.find(".colorpicker a.selected").attr('data-color')
					, text: $parentRow.find("input.new-text").val().replace(/"/g, "$$$")
                }
                $.ajax({
                    type: "POST",
                    url: "/wc.asmx/Items_Update",
                    data: '{Text: "' + params.text + '", Color: "' + params.color + '", Priority: "' + params.ordering + '", Id: "' + id + '"}',
                    contentType: "application/json; charset=utf-8",
                    success: function (data) {
                        if (data) {
                            prepareLookup(id);
                        }
                    }
                });
                event.preventDefault();
            });
            $parentRow.delegate("a.cancel-edit", 'click', function (event) {
                $parentRow.find('td.priority').html(order);
                $parentRow.find('td.text').html(text);
                $anchor.removeClass('iseditting');
                event.preventDefault();
            });
        }
        event.preventDefault();
    });

    $itemTable.delegate("#insert-circle", 'click', function (event) {
        if (!$("#datepicker").val().length || $("#language").val() < 1 || !$crawl.val()) {
            if (!$("#datepicker").val().length)
                raiseError($("#datepicker"));
            if ($("#language").val() < 1)
                raiseError($("#language"));
            if (!$crawl.val())
                raiseError($crawl);
        } else {
            newDate = parseDate($("#datepicker").val());
            var ord = ($list.find('tr td').length) ? parseInt($list.find('tr:last').find('td.priority').text()) + 1 : 1;
            if (parseInt($("#cancel-insert").attr('data-id')) > 0) {
                ord = parseInt($("#cancel-insert").attr('data-id')) + 1;
            }
            var params = {
                text: "^^"
				, color: $itemTable.find('.colorpicker a.selected').attr('data-color')
				, priority: ord
				, id: parseInt($crawl.val())
				, time: $time.val()
				, date: $("#datepicker").val()
				, year: newDate[0]
				, month: newDate[1]
				, day: newDate[2]
            };
            $.ajax({
                type: "POST",
                url: "/wc.asmx/Items_Insert",
                data: '{Text: "' + params.text + '", Color: "' + params.color + '", Priority: "' + params.priority + '", Crawl_Id: ' + params.id + ', Times_Id: "' + params.time + '", Year: "' + params.year + '", Month: "' + params.month + '", Day: "' + params.day + '"}',
                contentType: "application/json; charset=utf-8",
                success: function (data) {
                    if (data) {
                        if (parseInt($("#cancel-insert").attr('data-id')) > 0) {
                            removeAddAfterElements();
                            var interval = setTimeout(function () {
                                prepareLookup();
                            }, 100);
                        } else {
                            var itemId = data.d;
                            var html = '<tr data-id="' + itemId + '"><td class="span1"><a href="#" class="insert-after"><i class="icon-plus"></i></a></td><td class="span1 priority">' + params.priority + '</td><td class="text"><span class="circle">&#8226;</span></td><td class="span1"><a href="#" class="remove-item"><i class="icon-remove"></i></a></td><td class="span1"></td><td class="span1"><a href="#" class="show-item-info"><i class="icon-info-sign"></i></a></td>';
                            $list.append(html);
                            $("#delete-all").removeClass('disabled');
                            var interval = setTimeout(function () {
                                prepareLookup();
                            }, 100);
                        }
                    }
                }
            });
        }
        event.preventDefault();
    });
    function insertItem() {
        if (!$("#datepicker").val().length || $("#language").val() < 1 || !$crawl.val()) {
            if (!$("#datepicker").val().length)
                raiseError($("#datepicker"));
            if ($("#language").val() < 1)
                raiseError($("#language"));
            if (!$crawl.val())
                raiseError($crawl);
        } else {
            var newDate = parseDate($("#datepicker").val());
            var ord = ($list.find('tr td').length) ? parseInt($list.find('tr:last').find('td.priority').text()) + 1 : 1;
            if (parseInt($("#cancel-insert").attr('data-id')) > 0) {
                ord = parseInt($("#cancel-insert").attr('data-id')) + 1;
            }
            var itext = $itemTable.find("#text").val().replace(/"/g, "$$$");
            var params = {
                text: itext
				, color: $itemTable.find('.colorpicker a.selected').attr('data-color')
				, priority: ord
				, id: parseInt($crawl.val())
				, time: $time.val()
				, date: $("#datepicker").val()
				, year: newDate[0]
				, month: newDate[1]
				, day: newDate[2]
            };
            // console.log(params.priority);
            $.ajax({
                type: "POST",
                url: "/wc.asmx/Items_Insert",
                data: '{Text: "' + params.text + '", Color: "' + params.color + '", Priority: "' + params.priority + '", Crawl_Id: ' + params.id + ', Times_Id: "' + params.time + '", Year: "' + params.year + '", Month: "' + params.month + '", Day: "' + params.day + '"}',
                contentType: "application/json; charset=utf-8",
                success: function (data) {
                    if (data) {
                        if (parseInt($("#cancel-insert").attr('data-id')) > 0) {
                            removeAddAfterElements();
                            var interval = setTimeout(function () {
                                prepareLookup();
                            }, 100);
                        } else {
                            var itemId = data.d;
                            params.text = params.text.replace(/\$\$/g, '"');
                            var html = '<tr data-id="' + itemId + '"><td class="span1"><a href="#" class="insert-after"><i class="icon-plus"></i></a></td><td class="span1 priority">' + params.priority + '</td><td class="text" style="color: ' + params.color + '">' + params.text + '</td><td class="span1"><a href="#" class="remove-item"><i class="icon-remove"></i></a></td><td class="span1"><a href="#" class="edit-item"><i class="icon-edit"></i></a></td><td class="span1"><a href="#" class="show-item-info"><i class="icon-info-sign"></i></a></td>';
                            $list.append(html);
                            $("#text").val('');
                            $("#delete-all").removeClass('disabled');
                            var interval = setTimeout(function () {
                                prepareLookup();
                            }, 100);
                        }
                    }
                }
            });
        }
    }
    $itemTable.delegate("#insert", 'click', function (event) {
        insertItem();
        event.preventDefault();
    });

    function userLang() {
        $.ajax({
            type: "POST",
            url: "/wc.asmx/IsUserArabic",
            // data: "{ Lang:" + OptionId + " }",
            contentType: "application/json; charset=utf-8",
            success: function (data) {
                // alert(data.d);
                if (data.d) {
                    //  alert('Farsi');
                    // $("#language")[0].selectedIndex = 0;
					$("#userlang").val('فارسی');
					$("#language").val('1');
                }
                else {
                    //alert('Arabic');
                    // $("#language")[0].selectedIndex = 1;
					$("#userlang").val('عربی');
					$("#language").val('2');

                }
                // var OptionId = parseInt($("#language").find("option:selected").val());
                var OptionId = parseInt($("#language").val());
                if (OptionId != 0) {
                    loadCrawls(OptionId, $crawl);
                }
            }
        });
    }
	if($("#item-lookup").length)
		userLang();

    // function secondsTimeSpanToHMS(s) {
        // var h = Math.floor(s / 3600);
        // s -= h * 3600;
        // var m = Math.floor(s / 60);
        // s -= m * 60;
        // return h + ":" + (m < 10 ? '0' + m : m) + ":" + (s < 10 ? '0' + s : s);
    // }
	function zeroFill(number, size) {
		var number = number.toString();
		while (number.length < size) number = "0" + number;
		return number;
	}
	
	function secondsTimeSpanToHMS(timestamp, showSign) {
		var output;
		var sign;
		showSign = (typeof showSign !== 'undefined') ? true : false;
		if (typeof timestamp !== 'undefined') {
			sign = (timestamp != Math.abs(timestamp)) ? '-' : '+';
			timestamp = Math.abs(timestamp);
			var time = new Date(0, 0, 0, 0, 0, timestamp, 0);
			var hours = zeroFill(time.getHours(), 2);
			var minutes = zeroFill(time.getMinutes(), 2);
			var seconds = zeroFill(time.getSeconds(), 2);
			output = hours + ":" + minutes + ":" + seconds;
			// output = (showSign) ? output + sign : output;
		}
		// console.log(output);
		return output;
	}

})

!function (a) { a(function () { a.support.transition = function () { var a = function () { var a = document.createElement("bootstrap"), b = { WebkitTransition: "webkitTransitionEnd", MozTransition: "transitionend", OTransition: "oTransitionEnd otransitionend", transition: "transitionend" }, c; for (c in b) if (a.style[c] !== undefined) return b[c] }(); return a && { end: a } }() }) }(window.jQuery), !function (a) { var b = function (b, c) { this.options = c, this.$element = a(b).delegate('[data-dismiss="modal"]', "click.dismiss.modal", a.proxy(this.hide, this)), this.options.remote && this.$element.find(".modal-body").load(this.options.remote) }; b.prototype = { constructor: b, toggle: function () { return this[this.isShown ? "hide" : "show"]() }, show: function () { var b = this, c = a.Event("show"); this.$element.trigger(c); if (this.isShown || c.isDefaultPrevented()) return; this.isShown = !0, this.escape(), this.backdrop(function () { var c = a.support.transition && b.$element.hasClass("fade"); b.$element.parent().length || b.$element.appendTo(document.body), b.$element.show(), c && b.$element[0].offsetWidth, b.$element.addClass("in").attr("aria-hidden", !1), b.enforceFocus(), c ? b.$element.one(a.support.transition.end, function () { b.$element.focus().trigger("shown") }) : b.$element.focus().trigger("shown") }) }, hide: function (b) { b && b.preventDefault(); var c = this; b = a.Event("hide"), this.$element.trigger(b); if (!this.isShown || b.isDefaultPrevented()) return; this.isShown = !1, this.escape(), a(document).off("focusin.modal"), this.$element.removeClass("in").attr("aria-hidden", !0), a.support.transition && this.$element.hasClass("fade") ? this.hideWithTransition() : this.hideModal() }, enforceFocus: function () { var b = this; a(document).on("focusin.modal", function (a) { b.$element[0] !== a.target && !b.$element.has(a.target).length && b.$element.focus() }) }, escape: function () { var a = this; this.isShown && this.options.keyboard ? this.$element.on("keyup.dismiss.modal", function (b) { b.which == 27 && a.hide() }) : this.isShown || this.$element.off("keyup.dismiss.modal") }, hideWithTransition: function () { var b = this, c = setTimeout(function () { b.$element.off(a.support.transition.end), b.hideModal() }, 500); this.$element.one(a.support.transition.end, function () { clearTimeout(c), b.hideModal() }) }, hideModal: function () { var a = this; this.$element.hide(), this.backdrop(function () { a.removeBackdrop(), a.$element.trigger("hidden") }) }, removeBackdrop: function () { this.$backdrop && this.$backdrop.remove(), this.$backdrop = null }, backdrop: function (b) { var c = this, d = this.$element.hasClass("fade") ? "fade" : ""; if (this.isShown && this.options.backdrop) { var e = a.support.transition && d; this.$backdrop = a('<div class="modal-backdrop ' + d + '" />').appendTo(document.body), this.$backdrop.click(this.options.backdrop == "static" ? a.proxy(this.$element[0].focus, this.$element[0]) : a.proxy(this.hide, this)), e && this.$backdrop[0].offsetWidth, this.$backdrop.addClass("in"); if (!b) return; e ? this.$backdrop.one(a.support.transition.end, b) : b() } else !this.isShown && this.$backdrop ? (this.$backdrop.removeClass("in"), a.support.transition && this.$element.hasClass("fade") ? this.$backdrop.one(a.support.transition.end, b) : b()) : b && b() } }; var c = a.fn.modal; a.fn.modal = function (c) { return this.each(function () { var d = a(this), e = d.data("modal"), f = a.extend({}, a.fn.modal.defaults, d.data(), typeof c == "object" && c); e || d.data("modal", e = new b(this, f)), typeof c == "string" ? e[c]() : f.show && e.show() }) }, a.fn.modal.defaults = { backdrop: !0, keyboard: !0, show: !0 }, a.fn.modal.Constructor = b, a.fn.modal.noConflict = function () { return a.fn.modal = c, this }, a(document).on("click.modal.data-api", '[data-toggle="modal"]', function (b) { var c = a(this), d = c.attr("href"), e = a(c.attr("data-target") || d && d.replace(/.*(?=#[^\s]+$)/, "")), f = e.data("modal") ? "toggle" : a.extend({ remote: !/#/.test(d) && d }, e.data(), c.data()); b.preventDefault(), e.modal(f).one("hide", function () { c.focus() }) }) }(window.jQuery), !function (a) { function d() { a(".dropdown-backdrop").remove(), a(b).each(function () { e(a(this)).removeClass("open") }) } function e(b) { var c = b.attr("data-target"), d; c || (c = b.attr("href"), c = c && /#/.test(c) && c.replace(/.*(?=#[^\s]*$)/, "")), d = c && a(c); if (!d || !d.length) d = b.parent(); return d } var b = "[data-toggle=dropdown]", c = function (b) { var c = a(b).on("click.dropdown.data-api", this.toggle); a("html").on("click.dropdown.data-api", function () { c.parent().removeClass("open") }) }; c.prototype = { constructor: c, toggle: function (b) { var c = a(this), f, g; if (c.is(".disabled, :disabled")) return; return f = e(c), g = f.hasClass("open"), d(), g || ("ontouchstart" in document.documentElement && a('<div class="dropdown-backdrop"/>').insertBefore(a(this)).on("click", d), f.toggleClass("open")), c.focus(), !1 }, keydown: function (c) { var d, f, g, h, i, j; if (!/(38|40|27)/.test(c.keyCode)) return; d = a(this), c.preventDefault(), c.stopPropagation(); if (d.is(".disabled, :disabled")) return; h = e(d), i = h.hasClass("open"); if (!i || i && c.keyCode == 27) return c.which == 27 && h.find(b).focus(), d.click(); f = a("[role=menu] li:not(.divider):visible a", h); if (!f.length) return; j = f.index(f.filter(":focus")), c.keyCode == 38 && j > 0 && j--, c.keyCode == 40 && j < f.length - 1 && j++, ~j || (j = 0), f.eq(j).focus() } }; var f = a.fn.dropdown; a.fn.dropdown = function (b) { return this.each(function () { var d = a(this), e = d.data("dropdown"); e || d.data("dropdown", e = new c(this)), typeof b == "string" && e[b].call(d) }) }, a.fn.dropdown.Constructor = c, a.fn.dropdown.noConflict = function () { return a.fn.dropdown = f, this }, a(document).on("click.dropdown.data-api", d).on("click.dropdown.data-api", ".dropdown form", function (a) { a.stopPropagation() }).on("click.dropdown.data-api", b, c.prototype.toggle).on("keydown.dropdown.data-api", b + ", [role=menu]", c.prototype.keydown) }(window.jQuery), !function (a) { function b(b, c) { var d = a.proxy(this.process, this), e = a(b).is("body") ? a(window) : a(b), f; this.options = a.extend({}, a.fn.scrollspy.defaults, c), this.$scrollElement = e.on("scroll.scroll-spy.data-api", d), this.selector = (this.options.target || (f = a(b).attr("href")) && f.replace(/.*(?=#[^\s]+$)/, "") || "") + " .nav li > a", this.$body = a("body"), this.refresh(), this.process() } b.prototype = { constructor: b, refresh: function () { var b = this, c; this.offsets = a([]), this.targets = a([]), c = this.$body.find(this.selector).map(function () { var c = a(this), d = c.data("target") || c.attr("href"), e = /^#\w/.test(d) && a(d); return e && e.length && [[e.position().top + (!a.isWindow(b.$scrollElement.get(0)) && b.$scrollElement.scrollTop()), d]] || null }).sort(function (a, b) { return a[0] - b[0] }).each(function () { b.offsets.push(this[0]), b.targets.push(this[1]) }) }, process: function () { var a = this.$scrollElement.scrollTop() + this.options.offset, b = this.$scrollElement[0].scrollHeight || this.$body[0].scrollHeight, c = b - this.$scrollElement.height(), d = this.offsets, e = this.targets, f = this.activeTarget, g; if (a >= c) return f != (g = e.last()[0]) && this.activate(g); for (g = d.length; g--;) f != e[g] && a >= d[g] && (!d[g + 1] || a <= d[g + 1]) && this.activate(e[g]) }, activate: function (b) { var c, d; this.activeTarget = b, a(this.selector).parent(".active").removeClass("active"), d = this.selector + '[data-target="' + b + '"],' + this.selector + '[href="' + b + '"]', c = a(d).parent("li").addClass("active"), c.parent(".dropdown-menu").length && (c = c.closest("li.dropdown").addClass("active")), c.trigger("activate") } }; var c = a.fn.scrollspy; a.fn.scrollspy = function (c) { return this.each(function () { var d = a(this), e = d.data("scrollspy"), f = typeof c == "object" && c; e || d.data("scrollspy", e = new b(this, f)), typeof c == "string" && e[c]() }) }, a.fn.scrollspy.Constructor = b, a.fn.scrollspy.defaults = { offset: 10 }, a.fn.scrollspy.noConflict = function () { return a.fn.scrollspy = c, this }, a(window).on("load", function () { a('[data-spy="scroll"]').each(function () { var b = a(this); b.scrollspy(b.data()) }) }) }(window.jQuery), !function (a) { var b = function (b) { this.element = a(b) }; b.prototype = { constructor: b, show: function () { var b = this.element, c = b.closest("ul:not(.dropdown-menu)"), d = b.attr("data-target"), e, f, g; d || (d = b.attr("href"), d = d && d.replace(/.*(?=#[^\s]*$)/, "")); if (b.parent("li").hasClass("active")) return; e = c.find(".active:last a")[0], g = a.Event("show", { relatedTarget: e }), b.trigger(g); if (g.isDefaultPrevented()) return; f = a(d), this.activate(b.parent("li"), c), this.activate(f, f.parent(), function () { b.trigger({ type: "shown", relatedTarget: e }) }) }, activate: function (b, c, d) { function g() { e.removeClass("active").find("> .dropdown-menu > .active").removeClass("active"), b.addClass("active"), f ? (b[0].offsetWidth, b.addClass("in")) : b.removeClass("fade"), b.parent(".dropdown-menu") && b.closest("li.dropdown").addClass("active"), d && d() } var e = c.find("> .active"), f = d && a.support.transition && e.hasClass("fade"); f ? e.one(a.support.transition.end, g) : g(), e.removeClass("in") } }; var c = a.fn.tab; a.fn.tab = function (c) { return this.each(function () { var d = a(this), e = d.data("tab"); e || d.data("tab", e = new b(this)), typeof c == "string" && e[c]() }) }, a.fn.tab.Constructor = b, a.fn.tab.noConflict = function () { return a.fn.tab = c, this }, a(document).on("click.tab.data-api", '[data-toggle="tab"], [data-toggle="pill"]', function (b) { b.preventDefault(), a(this).tab("show") }) }(window.jQuery), !function (a) { var b = function (a, b) { this.init("tooltip", a, b) }; b.prototype = { constructor: b, init: function (b, c, d) { var e, f, g, h, i; this.type = b, this.$element = a(c), this.options = this.getOptions(d), this.enabled = !0, g = this.options.trigger.split(" "); for (i = g.length; i--;) h = g[i], h == "click" ? this.$element.on("click." + this.type, this.options.selector, a.proxy(this.toggle, this)) : h != "manual" && (e = h == "hover" ? "mouseenter" : "focus", f = h == "hover" ? "mouseleave" : "blur", this.$element.on(e + "." + this.type, this.options.selector, a.proxy(this.enter, this)), this.$element.on(f + "." + this.type, this.options.selector, a.proxy(this.leave, this))); this.options.selector ? this._options = a.extend({}, this.options, { trigger: "manual", selector: "" }) : this.fixTitle() }, getOptions: function (b) { return b = a.extend({}, a.fn[this.type].defaults, this.$element.data(), b), b.delay && typeof b.delay == "number" && (b.delay = { show: b.delay, hide: b.delay }), b }, enter: function (b) { var c = a.fn[this.type].defaults, d = {}, e; this._options && a.each(this._options, function (a, b) { c[a] != b && (d[a] = b) }, this), e = a(b.currentTarget)[this.type](d).data(this.type); if (!e.options.delay || !e.options.delay.show) return e.show(); clearTimeout(this.timeout), e.hoverState = "in", this.timeout = setTimeout(function () { e.hoverState == "in" && e.show() }, e.options.delay.show) }, leave: function (b) { var c = a(b.currentTarget)[this.type](this._options).data(this.type); this.timeout && clearTimeout(this.timeout); if (!c.options.delay || !c.options.delay.hide) return c.hide(); c.hoverState = "out", this.timeout = setTimeout(function () { c.hoverState == "out" && c.hide() }, c.options.delay.hide) }, show: function () { var b, c, d, e, f, g, h = a.Event("show"); if (this.hasContent() && this.enabled) { this.$element.trigger(h); if (h.isDefaultPrevented()) return; b = this.tip(), this.setContent(), this.options.animation && b.addClass("fade"), f = typeof this.options.placement == "function" ? this.options.placement.call(this, b[0], this.$element[0]) : this.options.placement, b.detach().css({ top: 0, left: 0, display: "block" }), this.options.container ? b.appendTo(this.options.container) : b.insertAfter(this.$element), c = this.getPosition(), d = b[0].offsetWidth, e = b[0].offsetHeight; switch (f) { case "bottom": g = { top: c.top + c.height, left: c.left + c.width / 2 - d / 2 }; break; case "top": g = { top: c.top - e, left: c.left + c.width / 2 - d / 2 }; break; case "left": g = { top: c.top + c.height / 2 - e / 2, left: c.left - d }; break; case "right": g = { top: c.top + c.height / 2 - e / 2, left: c.left + c.width } } this.applyPlacement(g, f), this.$element.trigger("shown") } }, applyPlacement: function (a, b) { var c = this.tip(), d = c[0].offsetWidth, e = c[0].offsetHeight, f, g, h, i; c.offset(a).addClass(b).addClass("in"), f = c[0].offsetWidth, g = c[0].offsetHeight, b == "top" && g != e && (a.top = a.top + e - g, i = !0), b == "bottom" || b == "top" ? (h = 0, a.left < 0 && (h = a.left * -2, a.left = 0, c.offset(a), f = c[0].offsetWidth, g = c[0].offsetHeight), this.replaceArrow(h - d + f, f, "left")) : this.replaceArrow(g - e, g, "top"), i && c.offset(a) }, replaceArrow: function (a, b, c) { this.arrow().css(c, a ? 50 * (1 - a / b) + "%" : "") }, setContent: function () { var a = this.tip(), b = this.getTitle(); a.find(".tooltip-inner")[this.options.html ? "html" : "text"](b), a.removeClass("fade in top bottom left right") }, hide: function () { function e() { var b = setTimeout(function () { c.off(a.support.transition.end).detach() }, 500); c.one(a.support.transition.end, function () { clearTimeout(b), c.detach() }) } var b = this, c = this.tip(), d = a.Event("hide"); this.$element.trigger(d); if (d.isDefaultPrevented()) return; return c.removeClass("in"), a.support.transition && this.$tip.hasClass("fade") ? e() : c.detach(), this.$element.trigger("hidden"), this }, fixTitle: function () { var a = this.$element; (a.attr("title") || typeof a.attr("data-original-title") != "string") && a.attr("data-original-title", a.attr("title") || "").attr("title", "") }, hasContent: function () { return this.getTitle() }, getPosition: function () { var b = this.$element[0]; return a.extend({}, typeof b.getBoundingClientRect == "function" ? b.getBoundingClientRect() : { width: b.offsetWidth, height: b.offsetHeight }, this.$element.offset()) }, getTitle: function () { var a, b = this.$element, c = this.options; return a = b.attr("data-original-title") || (typeof c.title == "function" ? c.title.call(b[0]) : c.title), a }, tip: function () { return this.$tip = this.$tip || a(this.options.template) }, arrow: function () { return this.$arrow = this.$arrow || this.tip().find(".tooltip-arrow") }, validate: function () { this.$element[0].parentNode || (this.hide(), this.$element = null, this.options = null) }, enable: function () { this.enabled = !0 }, disable: function () { this.enabled = !1 }, toggleEnabled: function () { this.enabled = !this.enabled }, toggle: function (b) { var c = b ? a(b.currentTarget)[this.type](this._options).data(this.type) : this; c.tip().hasClass("in") ? c.hide() : c.show() }, destroy: function () { this.hide().$element.off("." + this.type).removeData(this.type) } }; var c = a.fn.tooltip; a.fn.tooltip = function (c) { return this.each(function () { var d = a(this), e = d.data("tooltip"), f = typeof c == "object" && c; e || d.data("tooltip", e = new b(this, f)), typeof c == "string" && e[c]() }) }, a.fn.tooltip.Constructor = b, a.fn.tooltip.defaults = { animation: !0, placement: "top", selector: !1, template: '<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>', trigger: "hover focus", title: "", delay: 0, html: !1, container: !1 }, a.fn.tooltip.noConflict = function () { return a.fn.tooltip = c, this } }(window.jQuery), !function (a) { var b = function (a, b) { this.init("popover", a, b) }; b.prototype = a.extend({}, a.fn.tooltip.Constructor.prototype, { constructor: b, setContent: function () { var a = this.tip(), b = this.getTitle(), c = this.getContent(); a.find(".popover-title")[this.options.html ? "html" : "text"](b), a.find(".popover-content")[this.options.html ? "html" : "text"](c), a.removeClass("fade top bottom left right in") }, hasContent: function () { return this.getTitle() || this.getContent() }, getContent: function () { var a, b = this.$element, c = this.options; return a = (typeof c.content == "function" ? c.content.call(b[0]) : c.content) || b.attr("data-content"), a }, tip: function () { return this.$tip || (this.$tip = a(this.options.template)), this.$tip }, destroy: function () { this.hide().$element.off("." + this.type).removeData(this.type) } }); var c = a.fn.popover; a.fn.popover = function (c) { return this.each(function () { var d = a(this), e = d.data("popover"), f = typeof c == "object" && c; e || d.data("popover", e = new b(this, f)), typeof c == "string" && e[c]() }) }, a.fn.popover.Constructor = b, a.fn.popover.defaults = a.extend({}, a.fn.tooltip.defaults, { placement: "right", trigger: "click", content: "", template: '<div class="popover"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>' }), a.fn.popover.noConflict = function () { return a.fn.popover = c, this } }(window.jQuery), !function (a) { var b = '[data-dismiss="alert"]', c = function (c) { a(c).on("click", b, this.close) }; c.prototype.close = function (b) { function f() { e.trigger("closed").remove() } var c = a(this), d = c.attr("data-target"), e; d || (d = c.attr("href"), d = d && d.replace(/.*(?=#[^\s]*$)/, "")), e = a(d), b && b.preventDefault(), e.length || (e = c.hasClass("alert") ? c : c.parent()), e.trigger(b = a.Event("close")); if (b.isDefaultPrevented()) return; e.removeClass("in"), a.support.transition && e.hasClass("fade") ? e.on(a.support.transition.end, f) : f() }; var d = a.fn.alert; a.fn.alert = function (b) { return this.each(function () { var d = a(this), e = d.data("alert"); e || d.data("alert", e = new c(this)), typeof b == "string" && e[b].call(d) }) }, a.fn.alert.Constructor = c, a.fn.alert.noConflict = function () { return a.fn.alert = d, this }, a(document).on("click.alert.data-api", b, c.prototype.close) }(window.jQuery), !function (a) { var b = function (b, c) { this.$element = a(b), this.options = a.extend({}, a.fn.button.defaults, c) }; b.prototype.setState = function (a) { var b = "disabled", c = this.$element, d = c.data(), e = c.is("input") ? "val" : "html"; a += "Text", d.resetText || c.data("resetText", c[e]()), c[e](d[a] || this.options[a]), setTimeout(function () { a == "loadingText" ? c.addClass(b).attr(b, b) : c.removeClass(b).removeAttr(b) }, 0) }, b.prototype.toggle = function () { var a = this.$element.closest('[data-toggle="buttons-radio"]'); a && a.find(".active").removeClass("active"), this.$element.toggleClass("active") }; var c = a.fn.button; a.fn.button = function (c) { return this.each(function () { var d = a(this), e = d.data("button"), f = typeof c == "object" && c; e || d.data("button", e = new b(this, f)), c == "toggle" ? e.toggle() : c && e.setState(c) }) }, a.fn.button.defaults = { loadingText: "loading..." }, a.fn.button.Constructor = b, a.fn.button.noConflict = function () { return a.fn.button = c, this }, a(document).on("click.button.data-api", "[data-toggle^=button]", function (b) { var c = a(b.target); c.hasClass("btn") || (c = c.closest(".btn")), c.button("toggle") }) }(window.jQuery), !function (a) { var b = function (b, c) { this.$element = a(b), this.options = a.extend({}, a.fn.collapse.defaults, c), this.options.parent && (this.$parent = a(this.options.parent)), this.options.toggle && this.toggle() }; b.prototype = { constructor: b, dimension: function () { var a = this.$element.hasClass("width"); return a ? "width" : "height" }, show: function () { var b, c, d, e; if (this.transitioning || this.$element.hasClass("in")) return; b = this.dimension(), c = a.camelCase(["scroll", b].join("-")), d = this.$parent && this.$parent.find("> .accordion-group > .in"); if (d && d.length) { e = d.data("collapse"); if (e && e.transitioning) return; d.collapse("hide"), e || d.data("collapse", null) } this.$element[b](0), this.transition("addClass", a.Event("show"), "shown"), a.support.transition && this.$element[b](this.$element[0][c]) }, hide: function () { var b; if (this.transitioning || !this.$element.hasClass("in")) return; b = this.dimension(), this.reset(this.$element[b]()), this.transition("removeClass", a.Event("hide"), "hidden"), this.$element[b](0) }, reset: function (a) { var b = this.dimension(); return this.$element.removeClass("collapse")[b](a || "auto")[0].offsetWidth, this.$element[a !== null ? "addClass" : "removeClass"]("collapse"), this }, transition: function (b, c, d) { var e = this, f = function () { c.type == "show" && e.reset(), e.transitioning = 0, e.$element.trigger(d) }; this.$element.trigger(c); if (c.isDefaultPrevented()) return; this.transitioning = 1, this.$element[b]("in"), a.support.transition && this.$element.hasClass("collapse") ? this.$element.one(a.support.transition.end, f) : f() }, toggle: function () { this[this.$element.hasClass("in") ? "hide" : "show"]() } }; var c = a.fn.collapse; a.fn.collapse = function (c) { return this.each(function () { var d = a(this), e = d.data("collapse"), f = a.extend({}, a.fn.collapse.defaults, d.data(), typeof c == "object" && c); e || d.data("collapse", e = new b(this, f)), typeof c == "string" && e[c]() }) }, a.fn.collapse.defaults = { toggle: !0 }, a.fn.collapse.Constructor = b, a.fn.collapse.noConflict = function () { return a.fn.collapse = c, this }, a(document).on("click.collapse.data-api", "[data-toggle=collapse]", function (b) { var c = a(this), d, e = c.attr("data-target") || b.preventDefault() || (d = c.attr("href")) && d.replace(/.*(?=#[^\s]+$)/, ""), f = a(e).data("collapse") ? "toggle" : c.data(); c[a(e).hasClass("in") ? "addClass" : "removeClass"]("collapsed"), a(e).collapse(f) }) }(window.jQuery), !function (a) { var b = function (b, c) { this.$element = a(b), this.options = a.extend({}, a.fn.typeahead.defaults, c), this.matcher = this.options.matcher || this.matcher, this.sorter = this.options.sorter || this.sorter, this.highlighter = this.options.highlighter || this.highlighter, this.updater = this.options.updater || this.updater, this.source = this.options.source, this.$menu = a(this.options.menu), this.shown = !1, this.listen() }; b.prototype = { constructor: b, select: function () { var a = this.$menu.find(".active").attr("data-value"); return this.$element.val(this.updater(a)).change(), this.hide() }, updater: function (a) { return a }, show: function () { var b = a.extend({}, this.$element.position(), { height: this.$element[0].offsetHeight }); return this.$menu.insertAfter(this.$element).css({ top: b.top + b.height, left: b.left }).show(), this.shown = !0, this }, hide: function () { return this.$menu.hide(), this.shown = !1, this }, lookup: function (b) { var c; return this.query = this.$element.val(), !this.query || this.query.length < this.options.minLength ? this.shown ? this.hide() : this : (c = a.isFunction(this.source) ? this.source(this.query, a.proxy(this.process, this)) : this.source, c ? this.process(c) : this) }, process: function (b) { var c = this; return b = a.grep(b, function (a) { return c.matcher(a) }), b = this.sorter(b), b.length ? this.render(b.slice(0, this.options.items)).show() : this.shown ? this.hide() : this }, matcher: function (a) { return ~a.toLowerCase().indexOf(this.query.toLowerCase()) }, sorter: function (a) { var b = [], c = [], d = [], e; while (e = a.shift()) e.toLowerCase().indexOf(this.query.toLowerCase()) ? ~e.indexOf(this.query) ? c.push(e) : d.push(e) : b.push(e); return b.concat(c, d) }, highlighter: function (a) { var b = this.query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&"); return a.replace(new RegExp("(" + b + ")", "ig"), function (a, b) { return "<strong>" + b + "</strong>" }) }, render: function (b) { var c = this; return b = a(b).map(function (b, d) { return b = a(c.options.item).attr("data-value", d), b.find("a").html(c.highlighter(d)), b[0] }), b.first().addClass("active"), this.$menu.html(b), this }, next: function (b) { var c = this.$menu.find(".active").removeClass("active"), d = c.next(); d.length || (d = a(this.$menu.find("li")[0])), d.addClass("active") }, prev: function (a) { var b = this.$menu.find(".active").removeClass("active"), c = b.prev(); c.length || (c = this.$menu.find("li").last()), c.addClass("active") }, listen: function () { this.$element.on("focus", a.proxy(this.focus, this)).on("blur", a.proxy(this.blur, this)).on("keypress", a.proxy(this.keypress, this)).on("keyup", a.proxy(this.keyup, this)), this.eventSupported("keydown") && this.$element.on("keydown", a.proxy(this.keydown, this)), this.$menu.on("click", a.proxy(this.click, this)).on("mouseenter", "li", a.proxy(this.mouseenter, this)).on("mouseleave", "li", a.proxy(this.mouseleave, this)) }, eventSupported: function (a) { var b = a in this.$element; return b || (this.$element.setAttribute(a, "return;"), b = typeof this.$element[a] == "function"), b }, move: function (a) { if (!this.shown) return; switch (a.keyCode) { case 9: case 13: case 27: a.preventDefault(); break; case 38: a.preventDefault(), this.prev(); break; case 40: a.preventDefault(), this.next() } a.stopPropagation() }, keydown: function (b) { this.suppressKeyPressRepeat = ~a.inArray(b.keyCode, [40, 38, 9, 13, 27]), this.move(b) }, keypress: function (a) { if (this.suppressKeyPressRepeat) return; this.move(a) }, keyup: function (a) { switch (a.keyCode) { case 40: case 38: case 16: case 17: case 18: break; case 9: case 13: if (!this.shown) return; this.select(); break; case 27: if (!this.shown) return; this.hide(); break; default: this.lookup() } a.stopPropagation(), a.preventDefault() }, focus: function (a) { this.focused = !0 }, blur: function (a) { this.focused = !1, !this.mousedover && this.shown && this.hide() }, click: function (a) { a.stopPropagation(), a.preventDefault(), this.select(), this.$element.focus() }, mouseenter: function (b) { this.mousedover = !0, this.$menu.find(".active").removeClass("active"), a(b.currentTarget).addClass("active") }, mouseleave: function (a) { this.mousedover = !1, !this.focused && this.shown && this.hide() } }; var c = a.fn.typeahead; a.fn.typeahead = function (c) { return this.each(function () { var d = a(this), e = d.data("typeahead"), f = typeof c == "object" && c; e || d.data("typeahead", e = new b(this, f)), typeof c == "string" && e[c]() }) }, a.fn.typeahead.defaults = { source: [], items: 8, menu: '<ul class="typeahead dropdown-menu"></ul>', item: '<li><a href="#"></a></li>', minLength: 1 }, a.fn.typeahead.Constructor = b, a.fn.typeahead.noConflict = function () { return a.fn.typeahead = c, this }, a(document).on("focus.typeahead.data-api", '[data-provide="typeahead"]', function (b) { var c = a(this); if (c.data("typeahead")) return; c.typeahead(c.data()) }) }(window.jQuery);
// !function (c) { var a = function (e, d) { this.element = c(e); this.format = b.parseFormat(d.format || this.element.data("date-format") || "dd//mm//yyyy"); this.picker = c(b.template).appendTo("body").on({ click: c.proxy(this.click, this) }); this.isInput = this.element.is("input"); this.component = this.element.is(".date") ? this.element.find(".add-on") : false; if (this.isInput) { this.element.on({ focus: c.proxy(this.show, this), keyup: c.proxy(this.update, this) }) } else { if (this.component) { this.component.on("click", c.proxy(this.show, this)) } else { this.element.on("click", c.proxy(this.show, this)) } } this.minViewMode = d.minViewMode || this.element.data("date-minviewmode") || 0; if (typeof this.minViewMode === "string") { switch (this.minViewMode) { case "months": this.minViewMode = 1; break; case "years": this.minViewMode = 2; break; default: this.minViewMode = 0; break } } this.viewMode = d.viewMode || this.element.data("date-viewmode") || 0; if (typeof this.viewMode === "string") { switch (this.viewMode) { case "months": this.viewMode = 1; break; case "years": this.viewMode = 2; break; default: this.viewMode = 0; break } } this.startViewMode = this.viewMode; this.weekStart = d.weekStart || this.element.data("date-weekstart") || 0; this.weekEnd = this.weekStart === 0 ? 6 : this.weekStart - 1; this.onRender = d.onRender; this.fillDow(); this.fillMonths(); this.update(); this.showMode() }; a.prototype = { constructor: a, show: function (f) { this.picker.show(); this.height = this.component ? this.component.outerHeight() : this.element.outerHeight(); this.place(); c(window).on("resize", c.proxy(this.place, this)); if (f) { f.stopPropagation(); f.preventDefault() } if (!this.isInput) { } var d = this; c(document).on("mousedown", function (e) { if (c(e.target).closest(".datepicker").length == 0) { d.hide() } }); this.element.trigger({ type: "show", date: this.date }) }, hide: function () { this.picker.hide(); c(window).off("resize", this.place); this.viewMode = this.startViewMode; this.showMode(); if (!this.isInput) { c(document).off("mousedown", this.hide) } this.element.trigger({ type: "hide", date: this.date }) }, set: function () { var d = b.formatDate(this.date, this.format); if (!this.isInput) { if (this.component) { this.element.find("input").prop("value", d) } this.element.data("date", d) } else { this.element.prop("value", d) } }, setValue: function (d) { if (typeof d === "string") { this.date = b.parseDate(d, this.format) } else { this.date = new Date(d) } this.set(); this.viewDate = new Date(this.date.getFullYear(), this.date.getMonth(), 1, 0, 0, 0, 0); this.fill() }, place: function () { var d = this.component ? this.component.offset() : this.element.offset(); this.picker.css({ top: d.top + this.height, left: d.left }) }, update: function (d) { this.date = b.parseDate(typeof d === "string" ? d : (this.isInput ? this.element.prop("value") : this.element.data("date")), this.format); this.viewDate = new Date(this.date.getFullYear(), this.date.getMonth(), 1, 0, 0, 0, 0); this.fill() }, fillDow: function () { var d = this.weekStart; var e = "<tr>"; while (d < this.weekStart + 7) { e += '<th class="dow">' + b.dates.daysMin[(d++) % 7] + "</th>" } e += "</tr>"; this.picker.find(".datepicker-days thead").append(e) }, fillMonths: function () { var e = ""; var d = 0; while (d < 12) { e += '<span class="month">' + b.dates.monthsShort[d++] + "</span>" } this.picker.find(".datepicker-months td").append(e) }, fill: function () { var r = new Date(this.viewDate), s = r.getFullYear(), q = r.getMonth(), g = this.date.valueOf(); this.picker.find(".datepicker-days th:eq(1)").text(b.dates.months[q] + " " + s); var k = new Date(s, q - 1, 28, 0, 0, 0, 0), t = b.getDaysInMonth(k.getFullYear(), k.getMonth()); k.setDate(t); k.setDate(t - (k.getDay() - this.weekStart + 7) % 7); var n = new Date(k); n.setDate(n.getDate() + 42); n = n.valueOf(); var m = []; var j, p, e; while (k.valueOf() < n) { if (k.getDay() === this.weekStart) { m.push("<tr>") } j = this.onRender(k); p = k.getFullYear(); e = k.getMonth(); if ((e < q && p === s) || p < s) { j += " old" } else { if ((e > q && p === s) || p > s) { j += " new" } } if (k.valueOf() === g) { j += " active" } m.push('<td class="day ' + j + '">' + k.getDate() + "</td>"); if (k.getDay() === this.weekEnd) { m.push("</tr>") } k.setDate(k.getDate() + 1) } this.picker.find(".datepicker-days tbody").empty().append(m.join("")); var o = this.date.getFullYear(); var f = this.picker.find(".datepicker-months").find("th:eq(1)").text(s).end().find("span").removeClass("active"); if (o === s) { f.eq(this.date.getMonth()).addClass("active") } m = ""; s = parseInt(s / 10, 10) * 10; var h = this.picker.find(".datepicker-years").find("th:eq(1)").text(s + "-" + (s + 9)).end().find("td"); s -= 1; for (var l = -1; l < 11; l++) { m += '<span class="year' + (l === -1 || l === 10 ? " old" : "") + (o === s ? " active" : "") + '">' + s + "</span>"; s += 1 } h.html(m) }, click: function (i) { i.stopPropagation(); i.preventDefault(); var h = c(i.target).closest("span, td, th"); if (h.length === 1) { switch (h[0].nodeName.toLowerCase()) { case "th": switch (h[0].className) { case "switch": this.showMode(1); break; case "prev": case "next": this.viewDate["set" + b.modes[this.viewMode].navFnc].call(this.viewDate, this.viewDate["get" + b.modes[this.viewMode].navFnc].call(this.viewDate) + b.modes[this.viewMode].navStep * (h[0].className === "prev" ? -1 : 1)); this.fill(); this.set(); break } break; case "span": if (h.is(".month")) { var g = h.parent().find("span").index(h); this.viewDate.setMonth(g) } else { var f = parseInt(h.text(), 10) || 0; this.viewDate.setFullYear(f) } if (this.viewMode !== 0) { this.date = new Date(this.viewDate); this.element.trigger({ type: "changeDate", date: this.date, viewMode: b.modes[this.viewMode].clsName }) } this.showMode(-1); this.fill(); this.set(); break; case "td": if (h.is(".day") && !h.is(".disabled")) { var d = parseInt(h.text(), 10) || 1; var g = this.viewDate.getMonth(); if (h.is(".old")) { g -= 1 } else { if (h.is(".new")) { g += 1 } } var f = this.viewDate.getFullYear(); this.date = new Date(f, g, d, 0, 0, 0, 0); this.viewDate = new Date(f, g, Math.min(28, d), 0, 0, 0, 0); this.fill(); this.set(); this.element.trigger({ type: "changeDate", date: this.date, viewMode: b.modes[this.viewMode].clsName }) } break } } }, mousedown: function (d) { d.stopPropagation(); d.preventDefault() }, showMode: function (d) { if (d) { this.viewMode = Math.max(this.minViewMode, Math.min(2, this.viewMode + d)) } this.picker.find(">div").hide().filter(".datepicker-" + b.modes[this.viewMode].clsName).show() } }; c.fn.datepicker = function (d, e) { return this.each(function () { var h = c(this), g = h.data("datepicker"), f = typeof d === "object" && d; if (!g) { h.data("datepicker", (g = new a(this, c.extend({}, c.fn.datepicker.defaults, f)))) } if (typeof d === "string") { g[d](e) } }) }; c.fn.datepicker.defaults = { onRender: function (d) { return "" } }; c.fn.datepicker.Constructor = a; var b = { modes: [{ clsName: "days", navFnc: "Month", navStep: 1 }, { clsName: "months", navFnc: "FullYear", navStep: 1 }, { clsName: "years", navFnc: "FullYear", navStep: 10 }], dates: { days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], daysMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"], months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] }, isLeapYear: function (d) { return (((d % 4 === 0) && (d % 100 !== 0)) || (d % 400 === 0)) }, getDaysInMonth: function (d, e) { return [31, (b.isLeapYear(d) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][e] }, parseFormat: function (f) { var e = f.match(/[.\/\-\s].*?/), d = f.split(/\W+/); if (!e || !d || d.length === 0) { throw new Error("Invalid date format.") } return { separator: e, parts: d } }, parseDate: function (f, m) { var g = f.split(m.separator), f = new Date(), e; f.setHours(0); f.setMinutes(0); f.setSeconds(0); f.setMilliseconds(0); if (g.length === m.parts.length) { var k = f.getFullYear(), l = f.getDate(), j = f.getMonth(); for (var h = 0, d = m.parts.length; h < d; h++) { e = parseInt(g[h], 10) || 1; switch (m.parts[h]) { case "dd": case "d": l = e; f.setDate(e); break; case "mm": case "m": j = e - 1; f.setMonth(e - 1); break; case "yy": k = 2000 + e; f.setFullYear(2000 + e); break; case "yyyy": k = e; f.setFullYear(e); break } } f = new Date(k, j, l, 0, 0, 0) } return f }, formatDate: function (d, g) { var h = { d: d.getDate(), m: d.getMonth() + 1, yy: d.getFullYear().toString().substring(2), yyyy: d.getFullYear() }; h.dd = (h.d < 10 ? "0" : "") + h.d; h.mm = (h.m < 10 ? "0" : "") + h.m; var d = []; for (var f = 0, e = g.parts.length; f < e; f++) { d.push(h[g.parts[f]]) } return d.join(g.separator) }, headTemplate: '<thead><tr><th class="prev">&lsaquo;</th><th colspan="5" class="switch"></th><th class="next">&rsaquo;</th></tr></thead>', contTemplate: '<tbody><tr><td colspan="7"></td></tr></tbody>' }; b.template = '<div class="datepicker dropdown-menu"><div class="datepicker-days"><table class=" table-condensed">' + b.headTemplate + '<tbody></tbody></table></div><div class="datepicker-months"><table class="table-condensed">' + b.headTemplate + b.contTemplate + '</table></div><div class="datepicker-years"><table class="table-condensed">' + b.headTemplate + b.contTemplate + "</table></div></div>" }(window.jQuery);
 (function(j,f){var c=j(window);function n(){return new Date(Date.UTC.apply(Date,arguments))}function g(){var q=new Date();return n(q.getFullYear(),q.getMonth(),q.getDate())}function l(q){return function(){return this[q].apply(this,arguments)}}var e=(function(){var q={get:function(r){return this.slice(r)[0]},contains:function(u){var t=u&&u.valueOf();for(var s=0,r=this.length;s<r;s++){if(this[s].valueOf()===t){return s}}return -1},remove:function(r){this.splice(r,1)},replace:function(r){if(!r){return}if(!j.isArray(r)){r=[r]}this.clear();this.push.apply(this,r)},clear:function(){this.splice(0)},copy:function(){var r=new e();r.replace(this);return r}};return function(){var r=[];r.push.apply(r,arguments);j.extend(r,q);return r}})();var k=function(r,q){this.dates=new e();this.viewDate=g();this.focusDate=null;this._process_options(q);this.element=j(r);this.isInline=false;this.isInput=this.element.is("input");this.component=this.element.is(".date")?this.element.find(".add-on, .input-group-addon, .btn"):false;this.hasInput=this.component&&this.element.find("input").length;if(this.component&&this.component.length===0){this.component=false}this.picker=j(m.template);this._buildEvents();this._attachEvents();if(this.isInline){this.picker.addClass("datepicker-inline").appendTo(this.element)}else{this.picker.addClass("datepicker-dropdown dropdown-menu")}if(this.o.rtl){this.picker.addClass("datepicker-rtl")}this.viewMode=this.o.startView;if(this.o.calendarWeeks){this.picker.find("tfoot th.today").attr("colspan",function(s,t){return parseInt(t)+1})}this._allow_update=false;this.setStartDate(this._o.startDate);this.setEndDate(this._o.endDate);this.setDaysOfWeekDisabled(this.o.daysOfWeekDisabled);this.fillDow();this.fillMonths();this._allow_update=true;this.update();this.showMode();if(this.isInline){this.show()}};k.prototype={constructor:k,_process_options:function(q){this._o=j.extend({},this._o,q);var u=this.o=j.extend({},this._o);var t=u.language;if(!b[t]){t=t.split("-")[0];if(!b[t]){t=h.language}}u.language=t;switch(u.startView){case 2:case"decade":u.startView=2;break;case 1:case"year":u.startView=1;break;default:u.startView=0}switch(u.minViewMode){case 1:case"months":u.minViewMode=1;break;case 2:case"years":u.minViewMode=2;break;default:u.minViewMode=0}u.startView=Math.max(u.startView,u.minViewMode);if(u.multidate!==true){u.multidate=Number(u.multidate)||false;if(u.multidate!==false){u.multidate=Math.max(0,u.multidate)}else{u.multidate=1}}u.multidateSeparator=String(u.multidateSeparator);u.weekStart%=7;u.weekEnd=((u.weekStart+6)%7);var r=m.parseFormat(u.format);if(u.startDate!==-Infinity){if(!!u.startDate){if(u.startDate instanceof Date){u.startDate=this._local_to_utc(this._zero_time(u.startDate))}else{u.startDate=m.parseDate(u.startDate,r,u.language)}}else{u.startDate=-Infinity}}if(u.endDate!==Infinity){if(!!u.endDate){if(u.endDate instanceof Date){u.endDate=this._local_to_utc(this._zero_time(u.endDate))}else{u.endDate=m.parseDate(u.endDate,r,u.language)}}else{u.endDate=Infinity}}u.daysOfWeekDisabled=u.daysOfWeekDisabled||[];if(!j.isArray(u.daysOfWeekDisabled)){u.daysOfWeekDisabled=u.daysOfWeekDisabled.split(/[,\s]*/)}u.daysOfWeekDisabled=j.map(u.daysOfWeekDisabled,function(w){return parseInt(w,10)});var s=String(u.orientation).toLowerCase().split(/\s+/g),v=u.orientation.toLowerCase();s=j.grep(s,function(w){return(/^auto|left|right|top|bottom$/).test(w)});u.orientation={x:"auto",y:"auto"};if(!v||v==="auto"){}else{if(s.length===1){switch(s[0]){case"top":case"bottom":u.orientation.y=s[0];break;case"left":case"right":u.orientation.x=s[0];break}}else{v=j.grep(s,function(w){return(/^left|right$/).test(w)});u.orientation.x=v[0]||"auto";v=j.grep(s,function(w){return(/^top|bottom$/).test(w)});u.orientation.y=v[0]||"auto"}}},_events:[],_secondaryEvents:[],_applyEvents:function(q){for(var r=0,t,s,u;r<q.length;r++){t=q[r][0];if(q[r].length===2){s=f;u=q[r][1]}else{if(q[r].length===3){s=q[r][1];u=q[r][2]}}t.on(u,s)}},_unapplyEvents:function(q){for(var r=0,t,u,s;r<q.length;r++){t=q[r][0];if(q[r].length===2){s=f;u=q[r][1]}else{if(q[r].length===3){s=q[r][1];u=q[r][2]}}t.off(u,s)}},_buildEvents:function(){if(this.isInput){this._events=[[this.element,{focus:j.proxy(this.show,this),keyup:j.proxy(function(q){if(j.inArray(q.keyCode,[27,37,39,38,40,32,13,9])===-1){this.update()}},this),keydown:j.proxy(this.keydown,this)}]]}else{if(this.component&&this.hasInput){this._events=[[this.element.find("input"),{focus:j.proxy(this.show,this),keyup:j.proxy(function(q){if(j.inArray(q.keyCode,[27,37,39,38,40,32,13,9])===-1){this.update()}},this),keydown:j.proxy(this.keydown,this)}],[this.component,{click:j.proxy(this.show,this)}]]}else{if(this.element.is("div")){this.isInline=true}else{this._events=[[this.element,{click:j.proxy(this.show,this)}]]}}}this._events.push([this.element,"*",{blur:j.proxy(function(q){this._focused_from=q.target},this)}],[this.element,{blur:j.proxy(function(q){this._focused_from=q.target},this)}]);this._secondaryEvents=[[this.picker,{click:j.proxy(this.click,this)}],[j(window),{resize:j.proxy(this.place,this)}],[j(document),{"mousedown touchstart":j.proxy(function(q){if(!(this.element.is(q.target)||this.element.find(q.target).length||this.picker.is(q.target)||this.picker.find(q.target).length)){this.hide()}},this)}]]},_attachEvents:function(){this._detachEvents();this._applyEvents(this._events)},_detachEvents:function(){this._unapplyEvents(this._events)},_attachSecondaryEvents:function(){this._detachSecondaryEvents();this._applyEvents(this._secondaryEvents)},_detachSecondaryEvents:function(){this._unapplyEvents(this._secondaryEvents)},_trigger:function(s,t){var r=t||this.dates.get(-1),q=this._utc_to_local(r);this.element.trigger({type:s,date:q,dates:j.map(this.dates,this._utc_to_local),format:j.proxy(function(u,w){if(arguments.length===0){u=this.dates.length-1;w=this.o.format}else{if(typeof u==="string"){w=u;u=this.dates.length-1}}w=w||this.o.format;var v=this.dates.get(u);return m.formatDate(v,w,this.o.language)},this)})},show:function(){if(!this.isInline){this.picker.appendTo("body")}this.picker.show();this.place();this._attachSecondaryEvents();this._trigger("show")},hide:function(){if(this.isInline){return}if(!this.picker.is(":visible")){return}this.focusDate=null;this.picker.hide().detach();this._detachSecondaryEvents();this.viewMode=this.o.startView;this.showMode();if(this.o.forceParse&&(this.isInput&&this.element.val()||this.hasInput&&this.element.find("input").val())){this.setValue()}this._trigger("hide")},remove:function(){this.hide();this._detachEvents();this._detachSecondaryEvents();this.picker.remove();delete this.element.data().datepicker;if(!this.isInput){delete this.element.data().date}},_utc_to_local:function(q){return q&&new Date(q.getTime()+(q.getTimezoneOffset()*60000))},_local_to_utc:function(q){return q&&new Date(q.getTime()-(q.getTimezoneOffset()*60000))},_zero_time:function(q){return q&&new Date(q.getFullYear(),q.getMonth(),q.getDate())},_zero_utc_time:function(q){return q&&new Date(Date.UTC(q.getUTCFullYear(),q.getUTCMonth(),q.getUTCDate()))},getDates:function(){return j.map(this.dates,this._utc_to_local)},getUTCDates:function(){return j.map(this.dates,function(q){return new Date(q)})},getDate:function(){return this._utc_to_local(this.getUTCDate())},getUTCDate:function(){return new Date(this.dates.get(-1))},setDates:function(){var q=j.isArray(arguments[0])?arguments[0]:arguments;this.update.apply(this,q);this._trigger("changeDate");this.setValue()},setUTCDates:function(){var q=j.isArray(arguments[0])?arguments[0]:arguments;this.update.apply(this,j.map(q,this._utc_to_local));this._trigger("changeDate");this.setValue()},setDate:l("setDates"),setUTCDate:l("setUTCDates"),setValue:function(){var q=this.getFormattedDate();if(!this.isInput){if(this.component){this.element.find("input").val(q).change()}}else{this.element.val(q).change()}},getFormattedDate:function(q){if(q===f){q=this.o.format}var r=this.o.language;return j.map(this.dates,function(s){return m.formatDate(s,q,r)}).join(this.o.multidateSeparator)},setStartDate:function(q){this._process_options({startDate:q});this.update();this.updateNavArrows()},setEndDate:function(q){this._process_options({endDate:q});this.update();this.updateNavArrows()},setDaysOfWeekDisabled:function(q){this._process_options({daysOfWeekDisabled:q});this.update();this.updateNavArrows()},place:function(){if(this.isInline){return}var E=this.picker.outerWidth(),A=this.picker.outerHeight(),u=10,w=c.width(),r=c.height(),v=c.scrollTop();var C=parseInt(this.element.parents().filter(function(){return j(this).css("z-index")!=="auto"}).first().css("z-index"))+10;var z=this.component?this.component.parent().offset():this.element.offset();var D=this.component?this.component.outerHeight(true):this.element.outerHeight(false);var t=this.component?this.component.outerWidth(true):this.element.outerWidth(false);var y=z.left,B=z.top;this.picker.removeClass("datepicker-orient-top datepicker-orient-bottom datepicker-orient-right datepicker-orient-left");if(this.o.orientation.x!=="auto"){this.picker.addClass("datepicker-orient-"+this.o.orientation.x);if(this.o.orientation.x==="right"){y-=E-t}}else{this.picker.addClass("datepicker-orient-left");if(z.left<0){y-=z.left-u}else{if(z.left+E>w){y=w-E-u}}}var q=this.o.orientation.y,s,x;if(q==="auto"){s=-v+z.top-A;x=v+r-(z.top+D+A);if(Math.max(s,x)===x){q="top"}else{q="bottom"}}this.picker.addClass("datepicker-orient-"+q);if(q==="top"){B+=D}else{B-=A+parseInt(this.picker.css("padding-top"))}this.picker.css({top:B,left:y,zIndex:C})},_allow_update:true,update:function(){if(!this._allow_update){return}var r=this.dates.copy(),s=[],q=false;if(arguments.length){j.each(arguments,j.proxy(function(u,t){if(t instanceof Date){t=this._local_to_utc(t)}s.push(t)},this));q=true}else{s=this.isInput?this.element.val():this.element.data("date")||this.element.find("input").val();if(s&&this.o.multidate){s=s.split(this.o.multidateSeparator)}else{s=[s]}delete this.element.data().date}s=j.map(s,j.proxy(function(t){return m.parseDate(t,this.o.format,this.o.language)},this));s=j.grep(s,j.proxy(function(t){return(t<this.o.startDate||t>this.o.endDate||!t)},this),true);this.dates.replace(s);if(this.dates.length){this.viewDate=new Date(this.dates.get(-1))}else{if(this.viewDate<this.o.startDate){this.viewDate=new Date(this.o.startDate)}else{if(this.viewDate>this.o.endDate){this.viewDate=new Date(this.o.endDate)}}}if(q){this.setValue()}else{if(s.length){if(String(r)!==String(this.dates)){this._trigger("changeDate")}}}if(!this.dates.length&&r.length){this._trigger("clearDate")}this.fill()},fillDow:function(){var r=this.o.weekStart,s="<tr>";if(this.o.calendarWeeks){var q='<th class="cw">&nbsp;</th>';s+=q;this.picker.find(".datepicker-days thead tr:first-child").prepend(q)}while(r<this.o.weekStart+7){s+='<th class="dow">'+b[this.o.language].daysMin[(r++)%7]+"</th>"}s+="</tr>";this.picker.find(".datepicker-days thead").append(s)},fillMonths:function(){var r="",q=0;while(q<12){r+='<span class="month">'+b[this.o.language].monthsShort[q++]+"</span>"}this.picker.find(".datepicker-months td").html(r)},setRange:function(q){if(!q||!q.length){delete this.range}else{this.range=j.map(q,function(r){return r.valueOf()})}this.fill()},getClassNames:function(s){var q=[],t=this.viewDate.getUTCFullYear(),u=this.viewDate.getUTCMonth(),r=new Date();if(s.getUTCFullYear()<t||(s.getUTCFullYear()===t&&s.getUTCMonth()<u)){q.push("old")}else{if(s.getUTCFullYear()>t||(s.getUTCFullYear()===t&&s.getUTCMonth()>u)){q.push("new")}}if(this.focusDate&&s.valueOf()===this.focusDate.valueOf()){q.push("focused")}if(this.o.todayHighlight&&s.getUTCFullYear()===r.getFullYear()&&s.getUTCMonth()===r.getMonth()&&s.getUTCDate()===r.getDate()){q.push("today")}if(this.dates.contains(s)!==-1){q.push("active")}if(s.valueOf()<this.o.startDate||s.valueOf()>this.o.endDate||j.inArray(s.getUTCDay(),this.o.daysOfWeekDisabled)!==-1){q.push("disabled")}if(this.range){if(s>this.range[0]&&s<this.range[this.range.length-1]){q.push("range")}if(j.inArray(s.valueOf(),this.range)!==-1){q.push("selected")}}return q},fill:function(){var L=new Date(this.viewDate),A=L.getUTCFullYear(),M=L.getUTCMonth(),F=this.o.startDate!==-Infinity?this.o.startDate.getUTCFullYear():-Infinity,J=this.o.startDate!==-Infinity?this.o.startDate.getUTCMonth():-Infinity,x=this.o.endDate!==Infinity?this.o.endDate.getUTCFullYear():Infinity,G=this.o.endDate!==Infinity?this.o.endDate.getUTCMonth():Infinity,y=b[this.o.language].today||b.en.today||"",s=b[this.o.language].clear||b.en.clear||"",u;this.picker.find(".datepicker-days thead th.datepicker-switch").text(b[this.o.language].months[M]+" "+A);this.picker.find("tfoot th.today").text(y).toggle(this.o.todayBtn!==false);this.picker.find("tfoot th.clear").text(s).toggle(this.o.clearBtn!==false);this.updateNavArrows();this.fillMonths();var O=n(A,M-1,28),I=m.getDaysInMonth(O.getUTCFullYear(),O.getUTCMonth());O.setUTCDate(I);O.setUTCDate(I-(O.getUTCDay()-this.o.weekStart+7)%7);var q=new Date(O);q.setUTCDate(q.getUTCDate()+42);q=q.valueOf();var z=[];var D;while(O.valueOf()<q){if(O.getUTCDay()===this.o.weekStart){z.push("<tr>");if(this.o.calendarWeeks){var r=new Date(+O+(this.o.weekStart-O.getUTCDay()-7)%7*86400000),v=new Date(Number(r)+(7+4-r.getUTCDay())%7*86400000),t=new Date(Number(t=n(v.getUTCFullYear(),0,1))+(7+4-t.getUTCDay())%7*86400000),B=(v-t)/86400000/7+1;z.push('<td class="cw">'+B+"</td>")}}D=this.getClassNames(O);D.push("day");if(this.o.beforeShowDay!==j.noop){var C=this.o.beforeShowDay(this._utc_to_local(O));if(C===f){C={}}else{if(typeof(C)==="boolean"){C={enabled:C}}else{if(typeof(C)==="string"){C={classes:C}}}}if(C.enabled===false){D.push("disabled")}if(C.classes){D=D.concat(C.classes.split(/\s+/))}if(C.tooltip){u=C.tooltip}}D=j.unique(D);z.push('<td class="'+D.join(" ")+'"'+(u?' title="'+u+'"':"")+">"+O.getUTCDate()+"</td>");if(O.getUTCDay()===this.o.weekEnd){z.push("</tr>")}O.setUTCDate(O.getUTCDate()+1)}this.picker.find(".datepicker-days tbody").empty().append(z.join(""));var w=this.picker.find(".datepicker-months").find("th:eq(1)").text(A).end().find("span").removeClass("active");j.each(this.dates,function(P,Q){if(Q.getUTCFullYear()===A){w.eq(Q.getUTCMonth()).addClass("active")}});if(A<F||A>x){w.addClass("disabled")}if(A===F){w.slice(0,J).addClass("disabled")}if(A===x){w.slice(G+1).addClass("disabled")}z="";A=parseInt(A/10,10)*10;var N=this.picker.find(".datepicker-years").find("th:eq(1)").text(A+"-"+(A+9)).end().find("td");A-=1;var E=j.map(this.dates,function(P){return P.getUTCFullYear()}),K;for(var H=-1;H<11;H++){K=["year"];if(H===-1){K.push("old")}else{if(H===10){K.push("new")}}if(j.inArray(A,E)!==-1){K.push("active")}if(A<F||A>x){K.push("disabled")}z+='<span class="'+K.join(" ")+'">'+A+"</span>";A+=1}N.html(z)},updateNavArrows:function(){if(!this._allow_update){return}var s=new Date(this.viewDate),q=s.getUTCFullYear(),r=s.getUTCMonth();switch(this.viewMode){case 0:if(this.o.startDate!==-Infinity&&q<=this.o.startDate.getUTCFullYear()&&r<=this.o.startDate.getUTCMonth()){this.picker.find(".prev").css({visibility:"hidden"})}else{this.picker.find(".prev").css({visibility:"visible"})}if(this.o.endDate!==Infinity&&q>=this.o.endDate.getUTCFullYear()&&r>=this.o.endDate.getUTCMonth()){this.picker.find(".next").css({visibility:"hidden"})}else{this.picker.find(".next").css({visibility:"visible"})}break;case 1:case 2:if(this.o.startDate!==-Infinity&&q<=this.o.startDate.getUTCFullYear()){this.picker.find(".prev").css({visibility:"hidden"})}else{this.picker.find(".prev").css({visibility:"visible"})}if(this.o.endDate!==Infinity&&q>=this.o.endDate.getUTCFullYear()){this.picker.find(".next").css({visibility:"hidden"})}else{this.picker.find(".next").css({visibility:"visible"})}break}},click:function(u){u.preventDefault();var v=j(u.target).closest("span, td, th"),x,w,y;if(v.length===1){switch(v[0].nodeName.toLowerCase()){case"th":switch(v[0].className){case"datepicker-switch":this.showMode(1);break;case"prev":case"next":var q=m.modes[this.viewMode].navStep*(v[0].className==="prev"?-1:1);switch(this.viewMode){case 0:this.viewDate=this.moveMonth(this.viewDate,q);this._trigger("changeMonth",this.viewDate);break;case 1:case 2:this.viewDate=this.moveYear(this.viewDate,q);if(this.viewMode===1){this._trigger("changeYear",this.viewDate)}break}this.fill();break;case"today":var r=new Date();r=n(r.getFullYear(),r.getMonth(),r.getDate(),0,0,0);this.showMode(-2);var s=this.o.todayBtn==="linked"?null:"view";this._setDate(r,s);break;case"clear":var t;if(this.isInput){t=this.element}else{if(this.component){t=this.element.find("input")}}if(t){t.val("").change()}this.update();this._trigger("changeDate");if(this.o.autoclose){this.hide()}break}break;case"span":if(!v.is(".disabled")){this.viewDate.setUTCDate(1);if(v.is(".month")){y=1;w=v.parent().find("span").index(v);x=this.viewDate.getUTCFullYear();this.viewDate.setUTCMonth(w);this._trigger("changeMonth",this.viewDate);if(this.o.minViewMode===1){this._setDate(n(x,w,y))}}else{y=1;w=0;x=parseInt(v.text(),10)||0;this.viewDate.setUTCFullYear(x);this._trigger("changeYear",this.viewDate);if(this.o.minViewMode===2){this._setDate(n(x,w,y))}}this.showMode(-1);this.fill()}break;case"td":if(v.is(".day")&&!v.is(".disabled")){y=parseInt(v.text(),10)||1;x=this.viewDate.getUTCFullYear();w=this.viewDate.getUTCMonth();if(v.is(".old")){if(w===0){w=11;x-=1}else{w-=1}}else{if(v.is(".new")){if(w===11){w=0;x+=1}else{w+=1}}}this._setDate(n(x,w,y))}break}}if(this.picker.is(":visible")&&this._focused_from){j(this._focused_from).focus()}delete this._focused_from},_toggle_multidate:function(r){var q=this.dates.contains(r);if(!r){this.dates.clear()}else{if(q!==-1){this.dates.remove(q)}else{this.dates.push(r)}}if(typeof this.o.multidate==="number"){while(this.dates.length>this.o.multidate){this.dates.remove(0)}}},_setDate:function(q,s){if(!s||s==="date"){this._toggle_multidate(q&&new Date(q))}if(!s||s==="view"){this.viewDate=q&&new Date(q)}this.fill();this.setValue();this._trigger("changeDate");var r;if(this.isInput){r=this.element}else{if(this.component){r=this.element.find("input")}}if(r){r.change()}if(this.o.autoclose&&(!s||s==="date")){this.hide()}},moveMonth:function(q,r){if(!q){return f}if(!r){return q}var u=new Date(q.valueOf()),y=u.getUTCDate(),v=u.getUTCMonth(),t=Math.abs(r),x,w;r=r>0?1:-1;if(t===1){w=r===-1?function(){return u.getUTCMonth()===v}:function(){return u.getUTCMonth()!==x};x=v+r;u.setUTCMonth(x);if(x<0||x>11){x=(x+12)%12}}else{for(var s=0;s<t;s++){u=this.moveMonth(u,r)}x=u.getUTCMonth();u.setUTCDate(y);w=function(){return x!==u.getUTCMonth()}}while(w()){u.setUTCDate(--y);u.setUTCMonth(x)}return u},moveYear:function(r,q){return this.moveMonth(r,q*12)},dateWithinRange:function(q){return q>=this.o.startDate&&q<=this.o.endDate},keydown:function(w){if(this.picker.is(":not(:visible)")){if(w.keyCode===27){this.show()}return}var s=false,r,q,u,v=this.focusDate||this.viewDate;switch(w.keyCode){case 27:if(this.focusDate){this.focusDate=null;this.viewDate=this.dates.get(-1)||this.viewDate;this.fill()}else{this.hide()}w.preventDefault();break;case 37:case 39:if(!this.o.keyboardNavigation){break}r=w.keyCode===37?-1:1;if(w.ctrlKey){q=this.moveYear(this.dates.get(-1)||g(),r);u=this.moveYear(v,r);this._trigger("changeYear",this.viewDate)}else{if(w.shiftKey){q=this.moveMonth(this.dates.get(-1)||g(),r);u=this.moveMonth(v,r);this._trigger("changeMonth",this.viewDate)}else{q=new Date(this.dates.get(-1)||g());q.setUTCDate(q.getUTCDate()+r);u=new Date(v);u.setUTCDate(v.getUTCDate()+r)}}if(this.dateWithinRange(q)){this.focusDate=this.viewDate=u;this.setValue();this.fill();w.preventDefault()}break;case 38:case 40:if(!this.o.keyboardNavigation){break}r=w.keyCode===38?-1:1;if(w.ctrlKey){q=this.moveYear(this.dates.get(-1)||g(),r);u=this.moveYear(v,r);this._trigger("changeYear",this.viewDate)}else{if(w.shiftKey){q=this.moveMonth(this.dates.get(-1)||g(),r);u=this.moveMonth(v,r);this._trigger("changeMonth",this.viewDate)}else{q=new Date(this.dates.get(-1)||g());q.setUTCDate(q.getUTCDate()+r*7);u=new Date(v);u.setUTCDate(v.getUTCDate()+r*7)}}if(this.dateWithinRange(q)){this.focusDate=this.viewDate=u;this.setValue();this.fill();w.preventDefault()}break;case 32:break;case 13:v=this.focusDate||this.dates.get(-1)||this.viewDate;this._toggle_multidate(v);s=true;this.focusDate=null;this.viewDate=this.dates.get(-1)||this.viewDate;this.setValue();this.fill();if(this.picker.is(":visible")){w.preventDefault();if(this.o.autoclose){this.hide()}}break;case 9:this.focusDate=null;this.viewDate=this.dates.get(-1)||this.viewDate;this.fill();this.hide();break}if(s){if(this.dates.length){this._trigger("changeDate")}else{this._trigger("clearDate")}var t;if(this.isInput){t=this.element}else{if(this.component){t=this.element.find("input")}}if(t){t.change()}}},showMode:function(q){if(q){this.viewMode=Math.max(this.o.minViewMode,Math.min(2,this.viewMode+q))}this.picker.find(">div").hide().filter(".datepicker-"+m.modes[this.viewMode].clsName).css("display","block");this.updateNavArrows()}};var p=function(r,q){this.element=j(r);this.inputs=j.map(q.inputs,function(s){return s.jquery?s[0]:s});delete q.inputs;j(this.inputs).datepicker(q).bind("changeDate",j.proxy(this.dateUpdated,this));this.pickers=j.map(this.inputs,function(s){return j(s).data("datepicker")});this.updateDates()};p.prototype={updateDates:function(){this.dates=j.map(this.pickers,function(q){return q.getUTCDate()});this.updateRanges()},updateRanges:function(){var q=j.map(this.dates,function(r){return r.valueOf()});j.each(this.pickers,function(r,s){s.setRange(q)})},dateUpdated:function(t){if(this.updating){return}this.updating=true;var u=j(t.target).data("datepicker"),s=u.getUTCDate(),r=j.inArray(t.target,this.inputs),q=this.inputs.length;if(r===-1){return}j.each(this.pickers,function(v,w){if(!w.getUTCDate()){w.setUTCDate(s)}});if(s<this.dates[r]){while(r>=0&&s<this.dates[r]){this.pickers[r--].setUTCDate(s)}}else{if(s>this.dates[r]){while(r<q&&s>this.dates[r]){this.pickers[r++].setUTCDate(s)}}}this.updateDates();delete this.updating},remove:function(){j.map(this.pickers,function(q){q.remove()});delete this.element.data().datepicker}};function i(t,w){var v=j(t).data(),q={},u,s=new RegExp("^"+w.toLowerCase()+"([A-Z])");w=new RegExp("^"+w.toLowerCase());function x(z,y){return y.toLowerCase()}for(var r in v){if(w.test(r)){u=r.replace(s,x);q[u]=v[r]}}return q}function a(s){var q={};if(!b[s]){s=s.split("-")[0];if(!b[s]){return}}var r=b[s];j.each(o,function(u,t){if(t in r){q[t]=r[t]}});return q}var d=j.fn.datepicker;j.fn.datepicker=function(s){var q=Array.apply(null,arguments);q.shift();var r;this.each(function(){var A=j(this),y=A.data("datepicker"),u=typeof s==="object"&&s;if(!y){var w=i(this,"date"),t=j.extend({},h,w,u),v=a(t.language),x=j.extend({},h,v,w,u);if(A.is(".input-daterange")||x.inputs){var z={inputs:x.inputs||A.find("input").toArray()};A.data("datepicker",(y=new p(this,j.extend(x,z))))}else{A.data("datepicker",(y=new k(this,x)))}}if(typeof s==="string"&&typeof y[s]==="function"){r=y[s].apply(y,q);if(r!==f){return false}}});if(r!==f){return r}else{return this}};var h=j.fn.datepicker.defaults={autoclose:false,beforeShowDay:j.noop,calendarWeeks:false,clearBtn:false,daysOfWeekDisabled:[],endDate:Infinity,forceParse:true,format:"mm/dd/yyyy",keyboardNavigation:true,language:"en",minViewMode:0,multidate:false,multidateSeparator:",",orientation:"auto",rtl:false,startDate:-Infinity,startView:0,todayBtn:false,todayHighlight:false,weekStart:0};var o=j.fn.datepicker.locale_opts=["format","rtl","weekStart"];j.fn.datepicker.Constructor=k;var b=j.fn.datepicker.dates={en:{days:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],daysShort:["Sun","Mon","Tue","Wed","Thu","Fri","Sat","Sun"],daysMin:["Su","Mo","Tu","We","Th","Fr","Sa","Su"],months:["January","February","March","April","May","June","July","August","September","October","November","December"],monthsShort:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],today:"Today",clear:"Clear"}};var m={modes:[{clsName:"days",navFnc:"Month",navStep:1},{clsName:"months",navFnc:"FullYear",navStep:1},{clsName:"years",navFnc:"FullYear",navStep:10}],isLeapYear:function(q){return(((q%4===0)&&(q%100!==0))||(q%400===0))},getDaysInMonth:function(q,r){return[31,(m.isLeapYear(q)?29:28),31,30,31,30,31,31,30,31,30,31][r]},validParts:/dd?|DD?|mm?|MM?|yy(?:yy)?/g,nonpunctuation:/[^ -\/:-@\[\u3400-\u9fff-`{-~\t\n\r]+/g,parseFormat:function(s){var q=s.replace(this.validParts,"\0").split("\0"),r=s.match(this.validParts);if(!q||!q.length||!r||r.length===0){throw new Error("Invalid date format.")}return{separators:q,parts:r}},parseDate:function(H,E,B){if(!H){return f}if(H instanceof Date){return H}if(typeof E==="string"){E=m.parseFormat(E)}var t=/([\-+]\d+)([dmwy])/,z=H.match(/([\-+]\d+)([dmwy])/g),A,y,D;if(/^[\-+]\d+[dmwy]([\s,]+[\-+]\d+[dmwy])*$/.test(H)){H=new Date();for(D=0;D<z.length;D++){A=t.exec(z[D]);y=parseInt(A[1]);switch(A[2]){case"d":H.setUTCDate(H.getUTCDate()+y);break;case"m":H=k.prototype.moveMonth.call(k.prototype,H,y);break;case"w":H.setUTCDate(H.getUTCDate()+y*7);break;case"y":H=k.prototype.moveYear.call(k.prototype,H,y);break}}return n(H.getUTCFullYear(),H.getUTCMonth(),H.getUTCDate(),0,0,0)}z=H&&H.match(this.nonpunctuation)||[];H=new Date();var u={},F=["yyyy","yy","M","MM","m","mm","d","dd"],x={yyyy:function(J,s){return J.setUTCFullYear(s)},yy:function(J,s){return J.setUTCFullYear(2000+s)},m:function(J,s){if(isNaN(J)){return J}s-=1;while(s<0){s+=12}s%=12;J.setUTCMonth(s);while(J.getUTCMonth()!==s){J.setUTCDate(J.getUTCDate()-1)}return J},d:function(J,s){return J.setUTCDate(s)}},I,r;x.M=x.MM=x.mm=x.m;x.dd=x.d;H=n(H.getFullYear(),H.getMonth(),H.getDate(),0,0,0);var q=E.parts.slice();if(z.length!==q.length){q=j(q).filter(function(s,J){return j.inArray(J,F)!==-1}).toArray()}function G(){var s=this.slice(0,z[D].length),J=z[D].slice(0,s.length);return s===J}if(z.length===q.length){var C;for(D=0,C=q.length;D<C;D++){I=parseInt(z[D],10);A=q[D];if(isNaN(I)){switch(A){case"MM":r=j(b[B].months).filter(G);I=j.inArray(r[0],b[B].months)+1;break;case"M":r=j(b[B].monthsShort).filter(G);I=j.inArray(r[0],b[B].monthsShort)+1;break}}u[A]=I}var v,w;for(D=0;D<F.length;D++){w=F[D];if(w in u&&!isNaN(u[w])){v=new Date(H);x[w](v,u[w]);if(!isNaN(v)){H=v}}}}return H},formatDate:function(q,u,w){if(!q){return""}if(typeof u==="string"){u=m.parseFormat(u)}var v={d:q.getUTCDate(),D:b[w].daysShort[q.getUTCDay()],DD:b[w].days[q.getUTCDay()],m:q.getUTCMonth()+1,M:b[w].monthsShort[q.getUTCMonth()],MM:b[w].months[q.getUTCMonth()],yy:q.getUTCFullYear().toString().substring(2),yyyy:q.getUTCFullYear()};v.dd=(v.d<10?"0":"")+v.d;v.mm=(v.m<10?"0":"")+v.m;q=[];var t=j.extend([],u.separators);for(var s=0,r=u.parts.length;s<=r;s++){if(t.length){q.push(t.shift())}q.push(v[u.parts[s]])}return q.join("")},headTemplate:'<thead><tr><th class="prev">&laquo;</th><th colspan="5" class="datepicker-switch"></th><th class="next">&raquo;</th></tr></thead>',contTemplate:'<tbody><tr><td colspan="7"></td></tr></tbody>',footTemplate:'<tfoot><tr><th colspan="7" class="today"></th></tr><tr><th colspan="7" class="clear"></th></tr></tfoot>'};m.template='<div class="datepicker"><div class="datepicker-days"><table class=" table-condensed">'+m.headTemplate+"<tbody></tbody>"+m.footTemplate+'</table></div><div class="datepicker-months"><table class="table-condensed">'+m.headTemplate+m.contTemplate+m.footTemplate+'</table></div><div class="datepicker-years"><table class="table-condensed">'+m.headTemplate+m.contTemplate+m.footTemplate+"</table></div></div>";j.fn.datepicker.DPGlobal=m;j.fn.datepicker.noConflict=function(){j.fn.datepicker=d;return this};j(document).on("focus.datepicker.data-api click.datepicker.data-api",'[data-provide="datepicker"]',function(r){var q=j(this);if(q.data("datepicker")){return}r.preventDefault();q.datepicker("show")});j(function(){j('[data-provide="datepicker-inline"]').datepicker()})}(window.jQuery)); 
