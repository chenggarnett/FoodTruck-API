import mongoose from 'mongoose';
import { Router } from 'express';
import FoodTruck from '../model/foodtruck';
import Review from '../model/review';

import { authenticate } from '../middleware/authMiddleware';

export default({ config, db }) => {
  let api = Router();

  // CRUD = Create Read Update Delete

  // '/v1/foodtruck/add' - Create
  api.post('/add', (req, res) => {
    let newFoodTruck = new FoodTruck();
    newFoodTruck.name = req.body.name;
    newFoodTruck.foodtype = req.body.foodtype;
    newFoodTruck.avgcost = req.body.avgcost;
    newFoodTruck.geometry.coordinates = req.body.geometry.coordinates;

    newFoodTruck.save(err => {
      if (err) {
        res.send(err);
      }
      res.json({ message: 'Foodtruck saved successfully'});
    });
  });

  // '/v1/foodtruck' - Read
  api.get('/', (req, res) => {
    // find all foodtrucks since the curly braces is empty
    FoodTruck.find({}, (err, foodtrucks) => {
      if (err){
        res.send(err);
      }
      res.json(foodtrucks);
    });
  });

  // '/v1/foodtruck/:id' - Read 1 foodtruck
  api.get('/:id', (req, res) => {
    FoodTruck.findById(req.params.id, (err, foodtruck) => {
      if (err) {
        res.send(err);
      }
      res.json(foodtruck);
    });
  });

  // '/v1/foodtruck/:id' - Update
  api.put('/:id', (req, res) => {
    FoodTruck.findById(req.params.id, (err, foodtruck) => {
      if (err) {
        res.send(err);
      }
      foodtruck.name = req.body.name; // save the name of the foodtruck
      foodtruck.save(err => {
        if (err) {
          res.send(err);
        }
        res.json({message: "Foodtruck info updated"});
      })
    });
  });

  // '/vq/foodtruck/:id' - Delete
  api.delete('/:id', authenticate, (req, res) => {
    FoodTruck.remove( {
      _id: req.params.id
    }, (err, foodtruck) => {
      if (err){
        res.send(err);
      }
      res.json({message: "Foodtruck successfully removed"});
    });
  });

  // add review for a specific foodtruck id
  // '/v1/foodtruck/reviews/add/:id'
  api.post('/reviews/add/:id', (req, res) => {
    FoodTruck.findById(req.params.id, (err, foodtruck) => {
      if (err) {
        res.send(err);
      }
      let newReview = new Review();
      newReview.title = req.body.title;
      newReview.text = req.body.text;
      newReview.foodtruck = foodtruck._id;
      newReview.save((err, review) => {
        if (err) {
          res.send(err);
        }
        foodtruck.reviews.push(newReview); // because in the foodtruck it is an array
        foodtruck.save(err => {
          if (err) {
            res.send(err);
          }
          res.json({ message: "Food truck review saved"});
        });
      });
    });
  });

  // get reviews for a specific food truck id
  // '/v1/foodtruck/reviews/:id'
  api.get('/reviews/:id', (req, res) => {
    Review.find({foodtruck: req.params.id}, (err, reviews) => {
      if (err) {
        res.send(err);
      }
      res.json(reviews);
    });
  });

  // find the food truck based on the food type
  // '/v1/foodtruck/foodtype/:id'
  api.get('/foodtype/:foodtype', (req, res) => {
    FoodTruck.find({foodtype:req.params.foodtype}, (err, foodtruck) => {
      if (err) {
        res.send(err);
      }
      res.json(foodtruck);
    });
  });

  return api;
}
