// Copyright 2017, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const model = require('./model-datastore');

const router = express.Router();

// Automatically parse request body as form data
router.use(bodyParser.urlencoded({extended: false}));

// Set Content-Type for all responses for these routes
router.use((req, res, next) => {
  res.set('Content-Type', 'text/html');
  next();
});

/**
 * GET /customers
 *
 * Display a page of books (up to ten at a time).
 */
router.get('/', (req, res, next) => {
  model.list(10, req.query.pageToken, (err, entities, cursor) => {
    if (err) {
      next(err);
      return;
    }
    res.render('customers/list.pug', {
      customers: entities,
      nextPageToken: cursor,
    });
  });
});

/**
 * GET /customers/add
 *
 * Display a form for creating a book.
 */
// [START add_get]
router.get('/add', (req, res) => {
  res.render('customers/form.pug', {
    customer: {},
    action: 'Add',
  });
});
// [END add_get]

/**
 * POST /customers/add
 *
 * Create a book.
 */
// [START add_post]
router.post('/add', (req, res, next) => {
  const data = req.body;

  // Save the data to the database.
  model.create(data, (err, savedData) => {
    if (err) {
      next(err);
      return;
    }
    res.redirect(`${req.baseUrl}/${savedData.id}`);
  });
});
// [END add_post]

/**
 * GET /customers/:id/edit
 *
 * Display a customer for editing.
 */
router.get('/:customer/edit', (req, res, next) => {
  model.read(req.params.customer, (err, entity) => {
    if (err) {
      next(err);
      return;
    }
    res.render('customers/form.pug', {
      customer: entity,
      action: 'Edit',
    });
  });
});

/**
 * POST /customers/:id/edit
 *
 * Update a customer.
 */
router.post('/:customer/edit', (req, res, next) => {
  const data = req.body;

  model.update(req.params.customer, data, (err, savedData) => {
    if (err) {
      next(err);
      return;
    }
    res.redirect(`${req.baseUrl}/${savedData.id}`);
  });
});

/**
 * GET /customers/:id
 *
 * Display a customer.
 */
router.get('/:customer', (req, res, next) => {
  model.read(req.params.customer, (err, entity) => {
    if (err) {
      next(err);
      return;
    }
    res.render('customers/view.pug', {
      customer: entity,
    });
  });
});

/**
 * GET /customers/:id/delete
 *
 * Delete a customer.
 */
router.get('/:customer/delete', (req, res, next) => {
  model.delete(req.params.customer, err => {
    if (err) {
      next(err);
      return;
    }
    res.redirect(req.baseUrl);
  });
});

/**
 * Errors on "/customers/*" routes.
 */
router.use((err, req, res, next) => {
  // Format error and forward to generic error handler for logging and
  // responding to the request
  err.response = err.message;
  next(err);
});

module.exports = router;
