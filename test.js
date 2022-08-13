function debounce(func, wait, immediate) {
	let timeout;
	return function() {
		let context = this, args = arguments;
		let later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		let callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

$(document).ready(function () {
    let eventAction = '';
    let lastMatch = '';

    $('#main-input').bind('input propertychange', debounce(function() {
        eventAction = 'Manual';
        let parsedUrl = ValidateUrl();
        if (parsedUrl) {
            $(this).val(parsedUrl);
        }
    }, 500));

    $('#original-image > img').on('load', (e) => {
        $('#error-message').text('');
        $('.loader').removeClass('loading');
        $('#original-image-wrapper').addClass('show');
        gtag('event', 'Download', {
            event_category: 'Download',
            event_label: eventAction
        });
    })
    .on('click', function (e) {
        gtag('event', 'Ad', {
            eventCategory: 'Ad',
            event_label: 'Image Click'
        });
    })
    .on('contextmenu', function (e) {
        e.preventDefault();
    }, false);;

    function ValidateUrl(eventAction) {
        let $input = $('#main-input').removeClass('has-error'), url = $input.val();
        url = url.replace('http://', '');
        url = url.replace('https://', '');

        $input.val(url);

        let imgMatch = url.match(/^vsco\.co\/([a-zA-Z0-9_-]+)\/media\/([a-zA-Z0-9]{24})/);
        let userMatch = url.match(/^vsco\.co\/([a-zA-Z0-9_-]+)/);
        let shortMatch = url.match(/^vs.co\/([a-zA-Z0-9]+)/);
        
        let match = imgMatch || userMatch || shortMatch;
        if (!match) {
            if (url.length === 0) $input.removeClass('has-error');
            else $input.addClass('has-error');
            return;
        }
        else if (lastMatch != match[0]) {
            lastMatch = match[0];
            if (userMatch) {
                eventAction = 'Profile';
            }
            $('#original-image-wrapper').removeClass('show');
            $('.loader').addClass('loading');
            $.get('parse?url=' + encodeURIComponent(match[0]))
                .then(function (res) {
                    $('#original-image').attr('href', 'http://adf.ly/19426956/' + res);
                    $('#original-image > img').attr('src', res);
                }, function (err) {
                    $('.loader').removeClass('loading');
                    let errorMessage = err.responseText || "Womp, something broke :( try again later."
                    $('#error-message').text(errorMessage);
                });
        }
        return match[0];
    }
});
