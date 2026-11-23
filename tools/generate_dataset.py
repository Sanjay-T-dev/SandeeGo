"""
Chennai-style food delivery dataset generator.
Run:  python tools/generate_dataset.py
Output: server/data/restaurants.csv, server/data/menu_items.csv

Restaurant names ellam fictional (real brands illa). Prices INR.
"""
import csv, random, os

random.seed(42)
OUT = os.path.join(os.path.dirname(__file__), '..', 'server', 'data')
os.makedirs(OUT, exist_ok=True)

# (name, description, base_price, category, is_veg, bestseller)
D = {}

D['South Indian'] = [
 ('Idli (3 pcs)', 'Soft steamed idli with sambar and chutneys', 55, 'Tiffin', 1, 1),
 ('Ghee Pongal', 'Creamy pongal tempered with pepper and ghee', 80, 'Tiffin', 1, 0),
 ('Plain Dosa', 'Crispy golden dosa with chutney and sambar', 60, 'Dosa', 1, 0),
 ('Masala Dosa', 'Dosa stuffed with spiced potato masala', 90, 'Dosa', 1, 1),
 ('Ghee Roast Dosa', 'Paper-thin roast dosa brushed with ghee', 105, 'Dosa', 1, 0),
 ('Onion Rava Dosa', 'Crispy rava dosa with onion and cashew', 110, 'Dosa', 1, 0),
 ('Podi Idli', 'Mini idlis tossed in gunpowder and gingelly oil', 85, 'Tiffin', 1, 0),
 ('Medu Vada (2 pcs)', 'Crispy urad dal vada', 50, 'Snacks', 1, 0),
 ('Sambar Vada', 'Vada soaked in hot sambar', 65, 'Snacks', 1, 0),
 ('Mini Tiffin', 'Idli, vada, pongal, dosa mini combo', 140, 'Combos', 1, 1),
 ('Lemon Rice', 'Tangy lemon rice with peanuts', 80, 'Rice', 1, 0),
 ('Curd Rice', 'Cool curd rice with pomegranate and pickle', 75, 'Rice', 1, 0),
 ('Veg Meals', 'Full meals: rice, sambar, rasam, kootu, poriyal, curd', 160, 'Meals', 1, 1),
 ('Egg Dosa', 'Dosa topped with egg and pepper', 100, 'Dosa', 0, 0),
 ('Chicken Dosa', 'Dosa layered with chicken masala', 150, 'Dosa', 0, 0),
 ('Filter Coffee', 'Strong decoction coffee', 35, 'Beverages', 1, 1),
]

D['Chettinad'] = [
 ('Chicken Chettinad', 'Pepper-roasted chicken in Chettinad masala', 270, 'Main Course', 0, 1),
 ('Mutton Kola Urundai', 'Fried spiced mutton balls', 250, 'Starters', 0, 0),
 ('Chicken 65', 'Crispy fried chicken with curry leaves', 210, 'Starters', 0, 1),
 ('Pepper Chicken Fry', 'Dry roasted pepper chicken', 240, 'Starters', 0, 0),
 ('Nattu Kozhi Kuzhambu', 'Country chicken gravy', 290, 'Main Course', 0, 0),
 ('Mutton Chukka', 'Dry-roasted mutton with onions and spices', 340, 'Main Course', 0, 0),
 ('Fish Fry', 'Masala-marinated seer fish fry', 320, 'Seafood', 0, 0),
 ('Prawn Thokku', 'Prawns in tangy roasted masala', 330, 'Seafood', 0, 0),
 ('Egg Curry', 'Chettinad egg gravy', 150, 'Main Course', 0, 0),
 ('Veg Kurma', 'Coconut based mixed veg kurma', 140, 'Main Course', 1, 0),
 ('Kal Dosa (2 pcs)', 'Soft thick dosa, perfect with gravy', 70, 'Breads', 1, 0),
 ('Parotta (2 pcs)', 'Flaky layered parotta', 60, 'Breads', 1, 1),
 ('Veechu Parotta', 'Hand-tossed thin parotta', 70, 'Breads', 1, 0),
 ('Chicken Meals', 'Rice with chicken gravy, rasam, poriyal, curd', 230, 'Meals', 0, 1),
 ('Paal Payasam', 'Creamy milk payasam', 80, 'Desserts', 1, 0),
]

D['Biryani'] = [
 ('Chicken Biryani', 'Seeraga samba biryani with juicy chicken', 240, 'Biryani', 0, 1),
 ('Mutton Biryani', 'Dum biryani with tender mutton', 330, 'Biryani', 0, 1),
 ('Egg Biryani', 'Biryani rice with masala eggs', 190, 'Biryani', 0, 0),
 ('Veg Biryani', 'Vegetable dum biryani', 170, 'Biryani', 1, 0),
 ('Paneer Biryani', 'Paneer tikka biryani', 210, 'Biryani', 1, 0),
 ('Prawn Biryani', 'Spicy prawn biryani', 320, 'Biryani', 0, 0),
 ('Chicken 65 Biryani', 'Biryani topped with Chicken 65', 270, 'Biryani', 0, 0),
 ('Chicken 65', 'Crispy fried chicken starter', 190, 'Starters', 0, 0),
 ('Chicken Lollipop (4 pcs)', 'Deep fried masala lollipops', 220, 'Starters', 0, 0),
 ('Mutton Sukka', 'Dry roasted mutton', 310, 'Starters', 0, 0),
 ('Raita', 'Cool onion-cucumber raita', 40, 'Sides', 1, 0),
 ('Brinjal Gravy', 'Spicy gravy for biryani', 50, 'Sides', 1, 0),
 ('Family Pack Chicken Biryani', 'Serves 3-4', 680, 'Combos', 0, 1),
]

D['North Indian'] = [
 ('Butter Chicken', 'Creamy tomato butter gravy with chicken', 290, 'Main Course', 0, 1),
 ('Chicken Tikka Masala', 'Tandoori chicken in spicy gravy', 280, 'Main Course', 0, 0),
 ('Dal Makhani', 'Slow-cooked black lentils with cream', 210, 'Main Course', 1, 1),
 ('Paneer Butter Masala', 'Paneer cubes in rich tomato gravy', 240, 'Main Course', 1, 1),
 ('Kadai Paneer', 'Paneer with capsicum in kadai masala', 250, 'Main Course', 1, 0),
 ('Palak Paneer', 'Paneer in spinach gravy', 235, 'Main Course', 1, 0),
 ('Mix Veg Curry', 'Seasonal vegetables in onion gravy', 190, 'Main Course', 1, 0),
 ('Chana Masala', 'Spicy chickpea curry', 170, 'Main Course', 1, 0),
 ('Butter Naan', 'Tandoor naan brushed with butter', 55, 'Breads', 1, 1),
 ('Garlic Naan', 'Naan with garlic and coriander', 65, 'Breads', 1, 0),
 ('Tandoori Roti', 'Whole wheat roti from tandoor', 30, 'Breads', 1, 0),
 ('Laccha Paratha', 'Layered flaky paratha', 55, 'Breads', 1, 0),
 ('Paneer Tikka', 'Char-grilled marinated paneer', 230, 'Starters', 1, 0),
 ('Tandoori Chicken (Half)', 'Smoky tandoor chicken', 270, 'Starters', 0, 0),
 ('Jeera Rice', 'Basmati rice tempered with cumin', 120, 'Rice', 1, 0),
 ('Veg Thali', 'Dal, sabzi, roti, rice, salad and sweet', 260, 'Combos', 1, 0),
]

D['Chinese'] = [
 ('Veg Fried Rice', 'Wok-tossed rice with vegetables', 150, 'Rice & Noodles', 1, 0),
 ('Chicken Fried Rice', 'Fried rice with chicken shreds', 185, 'Rice & Noodles', 0, 1),
 ('Egg Fried Rice', 'Fried rice with scrambled egg', 165, 'Rice & Noodles', 0, 0),
 ('Schezwan Noodles', 'Spicy schezwan veg noodles', 160, 'Rice & Noodles', 1, 0),
 ('Chicken Hakka Noodles', 'Stir fried noodles with chicken', 190, 'Rice & Noodles', 0, 1),
 ('Gobi Manchurian', 'Crispy cauliflower in manchurian sauce', 150, 'Starters', 1, 1),
 ('Paneer Chilli', 'Paneer tossed in chilli garlic sauce', 200, 'Starters', 1, 0),
 ('Chilli Chicken', 'Spicy boneless chicken', 210, 'Starters', 0, 1),
 ('Chicken Manchurian', 'Chicken balls in manchurian gravy', 205, 'Starters', 0, 0),
 ('Dragon Chicken', 'Crispy chicken in sweet-spicy glaze', 225, 'Starters', 0, 0),
 ('Veg Manchow Soup', 'Spicy soup with crispy noodles', 100, 'Soups', 1, 0),
 ('Chicken Sweet Corn Soup', 'Classic chicken sweet corn soup', 115, 'Soups', 0, 0),
 ('Schezwan Fried Rice Combo', 'Rice + gravy + starter combo', 260, 'Combos', 0, 0),
]

D['Pizza & Italian'] = [
 ('Margherita Pizza', 'Classic cheese and tomato', 210, 'Pizza', 1, 1),
 ('Farmhouse Pizza', 'Capsicum, onion, mushroom, corn', 300, 'Pizza', 1, 0),
 ('Paneer Tikka Pizza', 'Paneer tikka with onions and capsicum', 320, 'Pizza', 1, 0),
 ('Chicken Tikka Pizza', 'Tandoori chicken with onions', 340, 'Pizza', 0, 1),
 ('Pepperoni Pizza', 'Chicken pepperoni and mozzarella', 360, 'Pizza', 0, 0),
 ('White Sauce Pasta', 'Creamy penne in white sauce', 200, 'Pasta', 1, 1),
 ('Red Sauce Pasta', 'Penne in tangy arrabbiata', 190, 'Pasta', 1, 0),
 ('Chicken Alfredo Pasta', 'Creamy alfredo with grilled chicken', 260, 'Pasta', 0, 0),
 ('Garlic Bread with Cheese', 'Toasted garlic bread with mozzarella', 130, 'Sides', 1, 0),
 ('Veg Lasagna', 'Baked layered lasagna', 280, 'Pasta', 1, 0),
 ('Cheesy Fries', 'Fries loaded with cheese sauce', 140, 'Sides', 1, 0),
 ('Choco Lava Cake', 'Warm cake with molten chocolate', 110, 'Desserts', 1, 1),
]

D['Burgers & Fast Food'] = [
 ('Classic Veg Burger', 'Crispy veg patty, lettuce, mayo', 110, 'Burgers', 1, 0),
 ('Cheese Burger', 'Cheese-loaded veg burger', 140, 'Burgers', 1, 0),
 ('Crispy Chicken Burger', 'Fried chicken fillet with mayo', 160, 'Burgers', 0, 1),
 ('Double Patty Chicken Burger', 'Two juicy chicken patties', 230, 'Burgers', 0, 1),
 ('Peri Peri Fries', 'Fries tossed in peri peri masala', 110, 'Sides', 1, 1),
 ('Chicken Nuggets (6 pcs)', 'Crispy chicken nuggets with dip', 150, 'Sides', 0, 0),
 ('Chicken Wrap', 'Grilled chicken in tortilla wrap', 170, 'Wraps', 0, 0),
 ('Paneer Wrap', 'Spiced paneer in wrap', 160, 'Wraps', 1, 0),
 ('Fried Chicken (2 pcs)', 'Southern fried chicken', 190, 'Chicken', 0, 0),
 ('Hot Wings (6 pcs)', 'Spicy chicken wings', 210, 'Chicken', 0, 0),
 ('Burger Combo', 'Burger + fries + cold drink', 260, 'Combos', 0, 1),
]

D['Arabian'] = [
 ('Chicken Shawarma', 'Classic chicken shawarma roll', 110, 'Shawarma', 0, 1),
 ('Chicken Shawarma Plate', 'Shawarma with fries, hummus and salad', 210, 'Shawarma', 0, 0),
 ('Mutton Shawarma', 'Slow roasted mutton shawarma', 170, 'Shawarma', 0, 0),
 ('Falafel Wrap', 'Falafel with tahini in pita', 120, 'Shawarma', 1, 0),
 ('Chicken Mandi (Half)', 'Smoked rice with tender chicken', 420, 'Mandi', 0, 1),
 ('Mutton Mandi', 'Smoked rice with slow cooked mutton', 520, 'Mandi', 0, 0),
 ('Alfaham Chicken (Half)', 'Charcoal grilled chicken', 280, 'Grills', 0, 1),
 ('Grill Chicken Tikka', 'Smoky tikka skewers', 260, 'Grills', 0, 0),
 ('Hummus with Pita', 'Creamy chickpea dip with pita', 130, 'Starters', 1, 0),
 ('Khubz (2 pcs)', 'Arabian bread', 30, 'Sides', 1, 0),
 ('Garlic Mayo Dip', 'Creamy garlic dip', 25, 'Sides', 1, 0),
]

D['Kerala'] = [
 ('Appam with Veg Stew', 'Lacy appam with coconut milk stew', 150, 'Breakfast', 1, 1),
 ('Puttu with Kadala Curry', 'Steamed rice cake with black chana curry', 120, 'Breakfast', 1, 1),
 ('Kerala Parotta (2 pcs)', 'Soft layered parotta', 65, 'Breads', 1, 0),
 ('Beef Fry', 'Kerala style roasted beef', 260, 'Main Course', 0, 1),
 ('Chicken Roast', 'Kerala chicken roast', 250, 'Main Course', 0, 0),
 ('Karimeen Pollichathu', 'Pearl spot fish baked in banana leaf', 420, 'Seafood', 0, 0),
 ('Fish Curry Meals', 'Rice with fish curry and thoran', 230, 'Meals', 0, 0),
 ('Kerala Veg Meals', 'Sadya style meals', 190, 'Meals', 1, 0),
 ('Egg Roast', 'Egg roast with onion masala', 140, 'Main Course', 0, 0),
 ('Banana Fry (Pazham Pori)', 'Sweet banana fritters', 60, 'Snacks', 1, 0),
 ('Sulaimani Tea', 'Spiced black tea with lemon', 30, 'Beverages', 1, 0),
]

D['Street Food & Chaat'] = [
 ('Pani Puri (6 pcs)', 'Crispy puris with tangy water', 60, 'Chaat', 1, 1),
 ('Sev Puri', 'Puri topped with chutneys and sev', 70, 'Chaat', 1, 0),
 ('Bhel Puri', 'Puffed rice chaat', 65, 'Chaat', 1, 0),
 ('Dahi Puri', 'Puri with curd and sweet chutney', 80, 'Chaat', 1, 0),
 ('Samosa Chaat', 'Crushed samosa with chole and curd', 85, 'Chaat', 1, 0),
 ('Pav Bhaji', 'Spicy mashed veg curry with buttered pav', 130, 'Mains', 1, 1),
 ('Vada Pav (2 pcs)', 'Mumbai style vada pav', 60, 'Snacks', 1, 0),
 ('Aloo Tikki', 'Crispy potato tikki with chutneys', 80, 'Snacks', 1, 0),
 ('Egg Bonda (2 pcs)', 'Egg wrapped in spiced besan batter', 50, 'Snacks', 0, 0),
 ('Corn Chaat', 'Sweet corn with masala and lemon', 70, 'Chaat', 1, 0),
 ('Masala Chai', 'Hot spiced tea', 30, 'Beverages', 1, 0),
]

D['Desserts & Bakery'] = [
 ('Chocolate Truffle Cake (Slice)', 'Rich chocolate truffle', 130, 'Cakes', 1, 1),
 ('Red Velvet Cake (Slice)', 'Cream cheese frosted red velvet', 150, 'Cakes', 1, 0),
 ('Black Forest Cake (Slice)', 'Classic black forest', 120, 'Cakes', 1, 0),
 ('Brownie with Ice Cream', 'Hot brownie with vanilla scoop', 160, 'Desserts', 1, 1),
 ('Gulab Jamun (2 pcs)', 'Warm syrupy jamun', 70, 'Desserts', 1, 0),
 ('Rasmalai (2 pcs)', 'Soft paneer discs in saffron milk', 110, 'Desserts', 1, 0),
 ('Jigarthanda', 'Madurai special cold dessert drink', 120, 'Desserts', 1, 1),
 ('Falooda', 'Rose falooda with ice cream', 140, 'Desserts', 1, 0),
 ('Choco Chip Cookies (4 pcs)', 'Freshly baked cookies', 100, 'Bakery', 1, 0),
 ('Veg Puff', 'Flaky puff with veg masala', 30, 'Bakery', 1, 0),
 ('Egg Puff', 'Flaky puff with egg masala', 35, 'Bakery', 0, 0),
 ('Mango Milkshake', 'Fresh mango and milk', 120, 'Beverages', 1, 0),
]

D['Healthy'] = [
 ('Greek Salad', 'Cucumber, olives, feta, tomatoes', 190, 'Salads', 1, 0),
 ('Grilled Chicken Salad', 'Greens with grilled chicken breast', 240, 'Salads', 0, 1),
 ('Quinoa Bowl', 'Quinoa with roasted veggies and hummus', 250, 'Bowls', 1, 1),
 ('Millet Pongal Bowl', 'Foxtail millet pongal bowl', 160, 'Bowls', 1, 0),
 ('Paneer Tikka Bowl', 'Grilled paneer with brown rice', 270, 'Bowls', 1, 0),
 ('Egg White Omelette', 'Four egg whites with veggies', 130, 'Breakfast', 0, 0),
 ('Oats Smoothie Bowl', 'Oats, banana, berries', 180, 'Breakfast', 1, 0),
 ('Fresh Orange Juice', 'No sugar added', 110, 'Beverages', 1, 0),
 ('Watermelon Juice', 'Fresh pressed watermelon', 90, 'Beverages', 1, 0),
 ('Cold Pressed Green Juice', 'Spinach, cucumber, apple', 150, 'Beverages', 1, 0),
]

D['Seafood'] = [
 ('Fish Curry Rice', 'Rice with fish kuzhambu', 230, 'Meals', 0, 1),
 ('Fish Fry (Seer)', 'Masala marinated seer fry', 340, 'Starters', 0, 1),
 ('Prawn Masala', 'Prawns in spicy onion tomato masala', 340, 'Main Course', 0, 0),
 ('Crab Masala', 'Crab in thick spicy gravy', 380, 'Main Course', 0, 0),
 ('Squid Fry', 'Crispy fried calamari with spices', 290, 'Starters', 0, 0),
 ('Fish Finger (6 pcs)', 'Crumb fried fish fingers', 240, 'Starters', 0, 0),
 ('Prawn Fried Rice', 'Rice wok-tossed with prawns', 260, 'Rice', 0, 0),
 ('Meen Kuzhambu', 'Tamarind-based fish gravy', 250, 'Main Course', 0, 0),
 ('Lemon Rice', 'Tangy lemon rice', 80, 'Sides', 1, 0),
]

EXTRA_BEV = [
 ('Fresh Lime Soda', 'Sweet / salt / mixed', 60, 'Beverages', 1, 0),
 ('Cold Coffee', 'Chilled creamy coffee', 110, 'Beverages', 1, 0),
 ('Buttermilk', 'Spiced chaas', 35, 'Beverages', 1, 0),
 ('Rose Milk', 'Chilled rose milk', 55, 'Beverages', 1, 0),
 ('Soft Drink (300 ml)', 'Cola / lemon / orange', 40, 'Beverages', 1, 0),
]
EXTRA_DES = [
 ('Vanilla Ice Cream (2 scoops)', 'Classic vanilla', 90, 'Desserts', 1, 0),
 ('Gulab Jamun (2 pcs)', 'Warm syrupy jamun', 70, 'Desserts', 1, 0),
 ('Choco Lava Cake', 'Molten chocolate center', 110, 'Desserts', 1, 0),
]

AREAS = ['T Nagar', 'Adyar', 'Anna Nagar', 'Velachery', 'Mylapore', 'Nungambakkam',
         'Tambaram', 'OMR', 'Porur', 'Guindy', 'Kodambakkam', 'Besant Nagar',
         'Perambur', 'Alwarpet', 'Thiruvanmiyur']

# (name, primary cuisine, extra cuisine tags, emoji, pure_veg, description)
R = [
 ('Amma Mess', 'South Indian', 'Tiffin, Meals', '🥞', 1, 'Home style tiffin and meals'),
 ('Murugan Tiffin Centre', 'South Indian', 'Tiffin, Dosa', '🥞', 1, 'Dosa, idli and filter coffee since 1985'),
 ('Sri Annapoorna Bhavan', 'South Indian', 'Meals, Tiffin', '🍛', 1, 'Pure veg meals and tiffin'),
 ('Dosa Corner', 'South Indian', 'Dosa, Snacks', '🥞', 1, 'Over 25 varieties of dosa'),
 ('Madras Tiffin House', 'South Indian', 'Tiffin, Coffee', '☕', 1, 'Classic Madras breakfast'),
 ('Kovai Kitchen', 'South Indian', 'Meals, Dosa', '🍛', 0, 'South Indian meals with non-veg sides'),
 ('Chettinad Spice Route', 'Chettinad', 'Non-Veg, Meals', '🍗', 0, 'Authentic Chettinad pepper and masala'),
 ('Karaikudi Virundhu', 'Chettinad', 'Chettinad, Meals', '🍗', 0, 'Karaikudi style feasts'),
 ('Pepper Pot Chettinad', 'Chettinad', 'Chicken, Mutton', '🍗', 0, 'Spicy and fiery Chettinad'),
 ('Biryani Junction', 'Biryani', 'Biryani, Starters', '🍚', 0, 'Dum biryani and starters'),
 ('Dindigul Thalappakatti Style', 'Biryani', 'Biryani, Seeraga Samba', '🍚', 0, 'Seeraga samba biryani'),
 ('Ambur Dum House', 'Biryani', 'Biryani, Mutton', '🍚', 0, 'Ambur style star biryani'),
 ('Hyderabad Handi', 'Biryani', 'Biryani, Mughlai', '🍚', 0, 'Hyderabadi dum biryani'),
 ('Royal Biryani Co.', 'Biryani', 'Biryani', '🍚', 0, 'Family packs and combos'),
 ('Punjab Tadka', 'North Indian', 'Mughlai, Tandoori', '🍛', 0, 'Rich gravies and tandoor'),
 ('Delhi Darbar', 'North Indian', 'Tandoori, Breads', '🍛', 0, 'Butter chicken and naan'),
 ('Tandoor Nights', 'North Indian', 'Tandoori, Kebabs', '🍢', 0, 'Smoky tandoor specials'),
 ('Pure Veg Rasoi', 'North Indian', 'Veg, Thali', '🥘', 1, 'North Indian pure vegetarian'),
 ('Shree Bhojan', 'North Indian', 'Thali, Veg', '🥘', 1, 'Thali and veg curries'),
 ('Dragon Wok', 'Chinese', 'Indo-Chinese, Noodles', '🥡', 0, 'Indo-Chinese favourites'),
 ('Wok Express', 'Chinese', 'Noodles, Fried Rice', '🥡', 0, 'Quick wok-tossed meals'),
 ('Golden Chopsticks', 'Chinese', 'Chinese, Soups', '🥢', 0, 'Soups, starters and noodles'),
 ('Veg Wok House', 'Chinese', 'Indo-Chinese, Veg', '🥡', 1, 'Pure veg Indo-Chinese'),
 ('Pizza Corner', 'Pizza & Italian', 'Pizza, Pasta', '🍕', 0, 'Hand-tossed pizzas and pasta'),
 ('La Piazza Kitchen', 'Pizza & Italian', 'Italian, Pasta', '🍝', 0, 'Italian comfort food'),
 ('Slice Society', 'Pizza & Italian', 'Pizza, Desserts', '🍕', 0, 'Pizza by the slice'),
 ('Veggie Crust', 'Pizza & Italian', 'Pizza, Veg', '🍕', 1, 'Pure veg pizzas and pasta'),
 ('Burger Barn', 'Burgers & Fast Food', 'Burgers, Fries', '🍔', 0, 'Juicy burgers and fries'),
 ('Crispy Chick', 'Burgers & Fast Food', 'Fried Chicken, Wraps', '🍗', 0, 'Crispy fried chicken'),
 ('Stack & Smash', 'Burgers & Fast Food', 'Burgers, Wraps', '🍔', 0, 'Smashed patty burgers'),
 ('Shawarma Station', 'Arabian', 'Shawarma, Grills', '🌯', 0, 'Street style shawarma'),
 ('Al Mandi House', 'Arabian', 'Mandi, Grills', '🍖', 0, 'Mandi and charcoal grills'),
 ('Arabian Nights', 'Arabian', 'Shawarma, Mandi', '🌯', 0, 'Middle eastern flavours'),
 ('Malabar Kitchen', 'Kerala', 'Kerala, Seafood', '🥥', 0, 'Malabar and Kerala specials'),
 ('God\'s Own Meals', 'Kerala', 'Meals, Appam', '🥥', 0, 'Kerala meals and appam'),
 ('Chaat Gali', 'Street Food & Chaat', 'Chaat, Snacks', '🥙', 1, 'Pani puri, sev puri and more'),
 ('Mumbai Pav Co.', 'Street Food & Chaat', 'Pav Bhaji, Snacks', '🥙', 1, 'Mumbai street food'),
 ('Sweet Tooth', 'Desserts & Bakery', 'Cakes, Ice Cream', '🍰', 1, 'Cakes, ice creams and shakes'),
 ('Cake Walk Bakery', 'Desserts & Bakery', 'Bakery, Cakes', '🎂', 0, 'Fresh baked cakes and puffs'),
 ('Jigarthanda Junction', 'Desserts & Bakery', 'Desserts, Beverages', '🥤', 1, 'Madurai specials'),
 ('Sugar Rush', 'Desserts & Bakery', 'Desserts, Shakes', '🍨', 1, 'Desserts and milkshakes'),
 ('Green Bowl', 'Healthy', 'Salads, Bowls', '🥗', 0, 'Salads, bowls and juices'),
 ('Fit Fuel Kitchen', 'Healthy', 'Healthy, Protein', '🥗', 0, 'High protein meals'),
 ('Millet Magic', 'Healthy', 'Millets, Bowls', '🥣', 1, 'Millet based healthy food'),
 ('Coastal Catch', 'Seafood', 'Seafood, Meals', '🦐', 0, 'Fresh coastal seafood'),
 ('Marina Meen Kadai', 'Seafood', 'Fish, Prawn', '🐟', 0, 'Fish fry and curries'),
 ('Sea Salt Kitchen', 'Seafood', 'Seafood, Rice', '🦀', 0, 'Crab, prawn and squid'),
]

OFFERS = ['', '', '', '50% OFF up to ₹100', '20% OFF up to ₹75', 'Flat ₹60 OFF above ₹299',
          'Free delivery', '30% OFF up to ₹90', 'Flat ₹100 OFF above ₹499']

rest_rows, menu_rows = [], []
for rid, (name, cuisine, tags, emoji, pure_veg, desc) in enumerate(R, start=1):
    pool = list(D[cuisine])
    if pure_veg:
        pool = [d for d in pool if d[4] == 1]
    # extras (beverages/desserts), only if not already a dessert/bev heavy cuisine
    extras = EXTRA_BEV[:] + EXTRA_DES[:]
    random.shuffle(extras)
    extras = extras[:random.randint(2, 4)]
    names = {d[0] for d in pool}
    extras = [e for e in extras if e[0] not in names]

    n = random.randint(min(7, len(pool)), len(pool))
    chosen = random.sample(pool, n) + extras
    # price factor per restaurant (premium vs budget)
    factor = random.choice([0.9, 0.95, 1.0, 1.05, 1.1, 1.2])
    prices = []
    for (iname, idesc, price, cat, veg, best) in chosen:
        p = int(round(price * factor / 5.0) * 5)
        prices.append(p)
        menu_rows.append([rid, iname, idesc, p, cat, veg, best])
    avg = sum(prices) / len(prices)
    price_for_two = int(round(avg * 2.2 / 10.0) * 10)
    rating = round(random.uniform(3.6, 4.8), 1)
    rating_count = random.choice([60, 120, 340, 520, 800, 1200, 2100, 3500, 5000])
    delivery_time = random.choice([15, 20, 25, 30, 35, 40, 45])
    delivery_fee = random.choice([0, 15, 20, 25, 30, 35, 40])
    area = random.choice(AREAS)
    offer = random.choice(OFFERS)
    rest_rows.append([rid, name, cuisine, tags, area, rating, rating_count,
                      delivery_time, delivery_fee, price_for_two, offer, pure_veg, emoji, desc])

with open(os.path.join(OUT, 'restaurants.csv'), 'w', newline='', encoding='utf-8') as f:
    w = csv.writer(f)
    w.writerow(['id', 'name', 'cuisine', 'cuisine_tags', 'area', 'rating', 'rating_count',
                'delivery_time', 'delivery_fee', 'price_for_two', 'offer', 'is_pure_veg', 'emoji', 'description'])
    w.writerows(rest_rows)

with open(os.path.join(OUT, 'menu_items.csv'), 'w', newline='', encoding='utf-8') as f:
    w = csv.writer(f)
    w.writerow(['restaurant_id', 'name', 'description', 'price', 'category', 'is_veg', 'is_bestseller'])
    w.writerows(menu_rows)

print(f'{len(rest_rows)} restaurants, {len(menu_rows)} menu items written to {os.path.abspath(OUT)}')
