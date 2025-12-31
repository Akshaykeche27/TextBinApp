const express=require('express')
const router=express.Router()
const {nanoid}=require('nanoid')
const Paste=require('../models/Schema');

router.get('/',(req,res)=>{
   res.render('index')
})

router.post('/paste/create', async (req, res) => {
  try {
    const { content, destroyMode, customExpiry } = req.body;

    const nanoId = nanoid(12);

    let expiresAt = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000); // default 5 days

    if (destroyMode === 'CUSTOM' && customExpiry) {
      expiresAt = new Date(customExpiry);
    }

    const paste = new Paste({
      pasteId: nanoId,
      content,
      destroyMode: destroyMode === 'READ' ? 'READ' : 'TIME',
      expiresAt,
      hasBeenRead: false
    });

    await paste.save();

    res.render('success', {
      link: `${req.protocol}://${req.get('host')}/paste/${nanoId}`
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('something went wrong');
  }
});
router.get('/paste/:id', async (req, res) => {
  try {
    const pasteId = req.params.id;


    const paste = await Paste.findOne({ pasteId });

    if (!paste) {
      return res.status(404).render('expired');
    }

    
    if (paste.expiresAt && paste.expiresAt < new Date()) {
      await Paste.deleteOne({ pasteId });
      return res.render('expired');
    }

   
    if (paste.destroyMode === 'READ') {

      if (paste.hasBeenRead) {
        return res.render('expired');
      }

      await Paste.updateOne(
        { pasteId },
        { $set: { hasBeenRead: true } }
      );

      return res.render('view', { content: paste.content });
    }

   
    return res.render('view', { content: paste.content });

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});




module.exports = router;
