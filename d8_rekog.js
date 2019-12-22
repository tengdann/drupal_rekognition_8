// jQuery to find form submit, and runs image processing pipeline.
(function ($) {
    $(function () {
        jQueryObject = $(".form-submit");
        jQueryObject.ajaxSuccess(function(event, XMLHttpRequest, ajaxOptions) {
            ProcessImage();
        });
    });
})(jQuery);

// Needed for global variable declaration
var region;
var id;

// Access Drupal variables set in config
// Adapted from https://stackoverflow.com/questions/14234598/drupal-7-global-javascript-variables
(function ($) {
    Drupal.behaviors.badcamp19 = {
        attach: function (context, settings) {
            region = Drupal.settings.badcamp19.region;
            id = Drupal.settings.badcamp19.id;
        }
    };
})(jQuery);

// Calls DetectLabels API and provides formatted descriptor of image
function DetectLabels(imageData) {
    AWS.region = 'us-east-1';
    var rekognition = new AWS.Rekognition();
    var params = {
        Image: {
            Bytes: imageData
        },
        MaxLabels: 5,
//        MinConfidence: 95,
    };

    rekognition.detectLabels(params, function(err, data) {
        if (err) console.log(err, err.stack); // Something happened that went wrong, please check console for details.
        else {
            var alt_text = 'Image may contain:';
            alt_text += ' ' + data.Labels[0].Name;
            for (var i = 1; i < data.Labels.length; i++) {
                alt_text += ', ' + data.Labels[i].Name;
            }
            
            // Adds the alt text to appropriate field (for the custom module)
            // Format: "Image may contain: <tag>, <tag>, <tag>, ..., <tag>"
            jQuery(document).ready(function() {
                jQuery('input[id*="edit-field-alt-text"]').val(alt_text)
            });
        }
    });
}

// Loads selected image and unencodes image bytes for Rekognition DetectLabels API
function ProcessImage() {
    // Anonymous log-in into AWS services
    AnonLog();

    // Find the file_url from however Drupal stores it
    var file_url =  jQuery('.image-preview img').attr("src");

    // Extract data from file_url
    // Function adapted from https://stackoverflow.com/a/20285053
    function toDataURL(url) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                var reader = new FileReader();
                reader.onloadend = function() {
                    toAWS(reader.result);
                }
                reader.readAsDataURL(xhr.response)
            }
        };
        xhr.open('GET', url)
        xhr.responseType = 'blob'
        xhr.send();
    };

    // Converts extracted image data to base64 representation (for AWS usage)
    // Adapted from https://docs.aws.amazon.com/rekognition/latest/dg/image-bytes-javascript.html
    function toAWS(dataURL) {
        var image = null;
        var jpg = true;
        try {
            image = atob(dataURL.split(",")[1]); // Image is a JPEG
        }
        catch (e) {
            jpg = false; // Image is not a JPEG
        }
        if (jpg == false) {
            try {
                image = atob(dataURL.split(",")[1]); // Image is a PNG
            }
            catch (e) {
                alert("Not an image file Rekognition can process"); // File format not supported by Rekognition
            }
        }

        // Puts image into specified Rekognition input format
        var length = image.length;
        imageBytes = new ArrayBuffer(length);
        var ua = new Uint8Array(imageBytes);
        for (var i = 0; i < length; i++) {
            ua[i] = image.charCodeAt(i);
        }

        // Call Rekognition
        DetectLabels(imageBytes);
    };

    // Overall function call
    toDataURL(file_url);
}

// Provides anonymous log on to AWS services
function AnonLog() {
    // Configure the credentials provider to use your identity pool
    AWS.config.region = region;
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: id,
    });

    // Make the call to obtain credentials
    AWS.config.credentials.get(function () {
        // Credentials will be available when this function is called
        var accessKeyId = AWS.config.credentials.accessKeyId;
        var secretAcessKey = AWS.config.credentials.secretAccessKey;
        var sessionToken = AWS.config.credentials.sessionToken;
    });
}