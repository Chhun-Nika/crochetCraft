import sequelize from '../sequelize.js';
import User from './user.model.js';
import Category from './category.model.js';
import Product from './product.model.js';

(async () => {
  try {
    // Sync all models
    // await sequelize.sync({ force: true });
    // console.log('All tables created successfully.');

    // Seed categories
    // const categories = [
    //   { name: 'Plushies & Toys' },
    //   { name: 'Apparel & Accessories' },
    //   { name: 'Bags & Pouches' },
    //   { name: 'Crochet Supplies' },
    //   { name: 'Home & Decor' }
    // ];

    // const createdCategories = await Category.bulkCreate(categories, {
    //   ignoreDuplicates: true
    // });
    // console.log('Categories seeded successfully:', createdCategories.map(cat => cat.name));

    // Seed products
    const products = [
      {
        name: 'Crochet Teddy Bear',
        description: 'Classic teddy bear made with premium cotton yarn. Features embroidered face and soft stuffing.',
        price: 32.50,
        stock: 8,
        image_url: '/public/images/crochet-teddy-bear.svg',
        categoryId: 1
      },
      {
        name: 'Crochet Buuny',
        description: 'Classic bunny bear made with premium cotton yarn. Features embroidered face and soft stuffing.',
        price: 32.50,
        stock: 8,
        image_url: '/public/images/bunny.svg',
        categoryId: 1
      },
      {
        name: 'Crochet Chicken',
        description: 'Classic chicken bear made with premium cotton yarn. Features embroidered face and soft stuffing.',
        price: 32.50,
        stock: 8,
        image_url: '/public/images/chicken.svg',
        categoryId: 1
      },
      {
        name: 'Crochet Mini Frog',
        description: 'Classic mini frog bear made with premium cotton yarn. Features embroidered face and soft stuffing.',
        price: 32.50,
        stock: 8,
        image_url: '/public/images/mini-frog.svg',
        categoryId: 2
      },

      {
        name: 'Mini Dinosour',
        description: 'Handmade crochet Dinosour plushie, perfect for children and collectors. Made with soft acrylic yarn and safety eyes.',
        price: 10.99,
        stock: 5,
        image_url: '/public/images/dino.svg',
        categoryId: 1
      },
      {
        name: 'Fluffy',
        description: 'Handmade crochet fluffy plushie, perfect for children and collectors. Made with soft acrylic yarn and safety eyes.',
        price: 9,
        stock: 5,
        image_url: '/public/images/fluffy.svg',
        categoryId: 1
      },
      {
        name: 'Pixie',
        description: 'Handmade crochet pixie plushie, perfect for children and collectors. Made with soft acrylic yarn and safety eyes.',
        price: 15,
        stock: 10,
        image_url: '/public/images/pixie.svg',
        categoryId: 1
      },
      {
        name: 'Bear Sea',
        description: 'Handmade crochet Bear Sea plushie, perfect for children and collectors. Made with soft acrylic yarn and safety eyes.',
        price: 20,
        stock: 8,
        image_url: '/public/images/bear.svg',
        categoryId: 1
      },
      {
        name: 'Dinosour crochet',
        description: 'Handmade crochet Dinosour plushie, perfect for children and collectors. Made with soft acrylic yarn and safety eyes.',
        price: 25,
        stock: 20,
        image_url: '/public/images/mini-dino.svg',
        categoryId: 1
      },
      {
        name: 'Gary Snail',
        description: 'Handmade crochet Gary Snail plushie, perfect for children and collectors. Made with soft acrylic yarn and safety eyes.',
        price: 35,
        stock: 10,
        image_url: '/public/images/gary.svg',
        categoryId: 1
      },
      {
        name: 'Stitch Crochet',
        description: 'Handmade crochet Stitch plushie, perfect for children and collectors. Made with soft acrylic yarn and safety eyes.',
        price: 30,
        stock: 70,
        image_url: '/public/images/stitch.svg',
        categoryId: 1
      },

      // Apparel & Accessories (Category 2)
      {
        name: 'Lily keychain',
        description: 'Handmade crochet Lily Keychain, perfect for children and collectors. Made with soft acrylic yarn and safety eyes.',
        price: 5,
        stock: 70,
        image_url: '/public/images/lily.svg',
        categoryId: 2
      },
      {
        name: 'Cute Fish keychain',
        description: 'Handmade crochet Fish Keychain, perfect for children and collectors. Made with soft acrylic yarn and safety eyes.',
        price: 4,
        stock: 30,
        image_url: '/public/images/fish.svg',
        categoryId: 2
      },
      {
        name: 'Earring',
        description: 'Handmade crochet Earring keychain, perfect for children and collectors. Made with soft acrylic yarn and safety eyes.',
        price: 2,
        stock: 30,
        image_url: '/public/images/earring.svg',
        categoryId: 2
      },
      {
        name: 'Lip Crochet',
        description: 'Handmade crochet Lip keychain, perfect for children and collectors. Made with soft acrylic yarn and safety eyes.',
        price: 5,
        stock: 20,
        image_url: '/public/images/lip.svg',
        categoryId: 2
      },
      {
        name: 'Toroto Keychain',
        description: 'Handmade crochet Lip keychain, perfect for children and collectors. Made with soft acrylic yarn and safety eyes.',
        price: 5,
        stock: 20,
        image_url: '/public/images/toroto.svg',
        categoryId: 2
      },
      

      // bag and pouches (category 3)
      {
        name: 'Lumb Bag',
        description: 'Handmade crochet Lumb Bag, perfect for children and collectors. Made with soft acrylic yarn and safety eyes.',
        price: 10,
        stock: 20,
        image_url: '/public/images/lumb.svg',
        categoryId: 3
      },
      {
        name: 'Mini Bag',
        description: 'Handmade crochet mini Bag, perfect for children and collectors. Made with soft acrylic yarn and safety eyes.',
        price: 4,
        stock: 10,
        image_url: '/public/images/bag.svg',
        categoryId: 3
      },
      {
        name: 'HairBand',
        description: 'Handmade crochet hairband Bag, perfect for children and collectors. Made with soft acrylic yarn and safety eyes.',
        price: 5,
        stock: 20,
        image_url: '/public/images/hairband.svg',
        categoryId: 3
      },
      {
        name: 'Airpods crochet',
        description: 'Handmade crochet Airpods, perfect for children and collectors. Made with soft acrylic yarn and safety eyes.',
        price: 6,
        stock: 10,
        image_url: '/public/images/airpod.svg',
        categoryId: 3
      },
      {
        name: 'Fish Bag',
        description: 'Handmade Fish Bag, perfect for children and collectors. Made with soft acrylic yarn and safety eyes.',
        price: 10,
        stock: 20,
        image_url: '/public/images/fish-bag.svg',
        categoryId: 3
      },

      // Crochet Supplies (category 4)
      {
        name: 'Cute Hook',
        description: 'Hook, perfect for children and collectors. Made with soft acrylic yarn and safety eyes.',
        price: 2,
        stock: 70,
        image_url: '/public/images/hook.svg',
        categoryId: 4
      },
      {
        name: 'Stitch Marker',
        description: 'Stitch Marker, perfect for children and collectors. Made with soft acrylic yarn and safety eyes.',
        price: 1,
        stock: 70,
        image_url: '/public/images/marker.svg',
        categoryId: 4
      },
      {
        name: 'Pink Yarn',
        description: 'Pink Yarn, perfect for children and collectors. Made with soft acrylic yarn and safety eyes.',
        price: 1,
        stock: 100,
        image_url: '/public/images/pink-yarn.svg',
        categoryId: 4
      },
      {
        name: 'White Yarn',
        description: 'White Yarn, perfect for children and collectors. Made with soft acrylic yarn and safety eyes.',
        price: 1,
        stock: 100,
        image_url: '/public/images/white-yarn.svg',
        categoryId: 4
      },
      {
        name: 'White Yarn',
        description: 'White Yarn, perfect for children and collectors. Made with soft acrylic yarn and safety eyes.',
        price: 1,
        stock: 100,
        image_url: '/public/images/white-yarn.svg',
        categoryId: 4
      },
      {
        name: 'Set of Yarn',
        description: 'Set of Yarn, perfect for children and collectors. Made with soft acrylic yarn and safety eyes.',
        price: 1,
        stock: 100,
        image_url: '/public/images/set-yarn.svg',
        categoryId: 4
      },
      {
        name: 'SkyBlue Yarn',
        description: 'SkyBlueYarn, perfect for children and collectors. Made with soft acrylic yarn and safety eyes.',
        price: 1,
        stock: 100,
        image_url: '/public/images/skyblue.svg',
        categoryId: 4
      },

      // Home & Decor (category 5)
      {
        name: 'Wall Hanging',
        description: 'Handmade Wall Hanging, perfect for children and collectors. Made with soft acrylic yarn and safety eyes.',
        price: 10,
        stock: 100,
        image_url: '/public/images/wall.svg',
        categoryId: 5
      },
      {
        name: 'Blanket Crochet',
        description: 'Handmade Blanket, perfect for children and collectors. Made with soft acrylic yarn and safety eyes.',
        price: 15,
        stock: 50,
        image_url: '/public/images/blanket.svg',
        categoryId: 5
      },
      {
        name: 'Bunting Garland',
        description: 'Handmade Bunting Garland, perfect for children and collectors. Made with soft acrylic yarn and safety eyes.',
        price: 5,
        stock: 50,
        image_url: '/public/images/bunting.svg',
        categoryId: 5
      },
      {
        name: 'Plant Hanging',
        description: 'Handmade Plant Hanging, perfect for children and collectors. Made with soft acrylic yarn and safety eyes.',
        price: 15,
        stock: 20,
        image_url: '/public/images/plant.svg',
        categoryId: 5
      },
      {
        name: 'Bear Mug Heat Mat',
        description: 'Handmade Bear Mug Heat Mat, perfect for children and collectors. Made with soft acrylic yarn and safety eyes.',
        price: 5,
        stock: 90,
        image_url: '/public/images/bear-mug.svg',
        categoryId: 5
      }
    ];

    const createdProducts = await Product.bulkCreate(products, {
      ignoreDuplicates: true
    });
    console.log('Products seeded successfully:', createdProducts.map(prod => prod.name));

  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await sequelize.close();
    process.exit();
  }
})();
