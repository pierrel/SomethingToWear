function(doc) {
    if (doc.doc_type == 'outfit') {
        shirt = doc.shirt_id;
        pants = doc.pants_id;
        shoes = doc.shoes_id;
        // first shirt and pants
        if (shirt !== '' && pants !== ''){
            emit([shirt, pants], 1);
        }
        // then shirt and shoes
        if (shirt !== '' && shoes !== '') {
            emit([shirt, shoes], 1)
        }
        // then pants and shoes
        if (pants !== '' && shoes !== '') {
            emit([pants, shoes], 1);
        }
    }
}