const mongoose = require('mongoose');
const Ispit = require('./ispit');
const Student = require('./student');
const Schema = mongoose.Schema;
const Admin = require('./admin');

const KolegijSchema = new Schema({
    naziv: String,
    nositelj: {
        type: Schema.Types.ObjectId,
        ref: 'Admin'
    },
    studenti: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
    ispiti: [{ type: Schema.Types.ObjectId, ref: 'Ispit' }]

});
KolegijSchema.post('findByIdAndDelete', async function (doc) {
    if (doc) {
        
        await Ispit.remove({
            _id: {
                $in: doc.ispiti
            }
        })


    }
})


module.exports = mongoose.model('Kolegij', KolegijSchema);