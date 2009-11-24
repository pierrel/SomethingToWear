function(doc) {
    var attrs = ['materials', 'colors', 'pattern', 'styles'];
    
    is_correct = function(doc) {
        var has_descriptors = true;
        for_search = attrs;
        for (var i in for_search) {
            part_name = for_search[i];
            has_descriptors = has_descriptors && doc[part_name] && doc[part_name].length >= 2;
        }
        
        return has_descriptors && doc.name && doc.uncut_image_url;
    }
    
    // returns an array of terms
    // terms is a string containing the term
    // example: if term = 'dark blue jeans', then the result is ['dark', 'blue', 'jeans', 'dark blue', 'dark blue jeans']
    gradual_split = function(term) {
        var all_terms = term.split(' ');
        var terms = term.split(' ');
        var j = 2;
        while (j <= all_terms.length) {
            terms.push(all_terms.slice(0, j).join(' '));
            j += 1;
        }
        return terms;
    }
    
    // return an array of terms that appear at least twice in the term_array_array
    // term_array_array is an array of arrays that looks like
    // [['blue', 'red'], ['blue', 'yellow'], etc]
    passing_search_terms = function(term_array_array) {
        var all_terms  = [];
        for (var i in term_array_array) {
            var term_array = term_array_array[i];
            for (var j in term_array) {
                all_terms = all_terms.concat(gradual_split(term_array[j]));
            }
        }
        
        var passing_terms = [];
        var all_terms_unique = [];
        var term_occurances = {};
        for (var i in all_terms) {
            term = all_terms[i]
            if (term_occurances[term]) {
                term_occurances[term] += 1;
            } else {
                term_occurances[term] = 1;
                all_terms_unique.push(term);
            }
        }
                
        for (var i in all_terms_unique) {
            var term = all_terms_unique[i];
            if (term_occurances[term] >= 2) {
                passing_terms.push(term);
            }
        }
        
        return passing_terms;
    }
        
    if (doc.doc_type == 'piece' && doc.placement && doc._attachments) { // make sure it is a piece and has an image
        
        // convert from placement to type
        if (doc.placement == 'tops') {
            type = 'shirt';
        } else if (doc.placement == 'bottoms') {
            type = 'pants';
        } else {
            type = doc.placement; // it's "shoes"
        }
        
        if (is_correct(doc)) {
            for (var index in attrs) {
                attr = attrs[index];
                
                var all_terms = passing_search_terms(doc[attr]);
                for (var term in all_terms) {
                    emit([type, all_terms[term]], null);
                }                
            }
            emit([type, doc.name], null);
        }
        
    }
}