const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/templates.controller');
const validate = require('../middlewares/validate');
const Joi = require('joi');

router.get('/',
  validate(Joi.object({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).max(100).optional(),
    tag: Joi.string().optional(),
    search: Joi.string().max(200).optional()
  }), 'query'),
  ctrl.list
);

router.get('/:id',
  validate(Joi.object({ id: Joi.string().required() }), 'params'),
  ctrl.get
);

router.post('/',
  validate(Joi.object({
    name: Joi.string().min(2).max(120).required(),
    description: Joi.string().max(1000).allow(''),
    tags: Joi.array().items(Joi.string()).default([]),
    author: Joi.string().max(120).default('system'),
    thumbnailUrl: Joi.string().uri().allow(''),
    data: Joi.any().default({})
  })),
  ctrl.create
);

router.delete('/:id',
  validate(Joi.object({ id: Joi.string().required() }), 'params'),
  ctrl.remove
);

module.exports = router;
