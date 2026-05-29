const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');
const announcementController = require('../controllers/announcement.controller');

router.post('/', auth, role(['coordinator','admin']), announcementController.createAnnouncement);
router.get('/', auth, announcementController.getAnnouncements);
router.get('/:id', auth, announcementController.getAnnouncementById);
router.put('/:id', auth, announcementController.updateAnnouncement);
router.delete('/:id', auth, announcementController.deleteAnnouncement);

module.exports = router;
