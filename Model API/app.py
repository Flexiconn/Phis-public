import numpy as np
import pandas as pd
from flask import Flask, request, jsonify, render_template
import pickle

app = Flask(__name__,template_folder='templates')
model = pickle.load(open('phishing_detection_model.sav', 'rb'))

@app.route('/predict',methods=['POST'])
def predict():
    '''
    For rendering results on HTML GUI
    '''
    features = [x for x in request.form.values()]
    final_features = [np.array(features)]
    column_names=['length_url','length_hostname','nb_dots','nb_at','nb_qm','nb_eq','nb_underscore','nb_www','nb_com','https_token','ratio_digits_url','ratio_digits_host','port','tld_in_subdomain','abnormal_subdomain','nb_subdomains','prefix_suffix','length_words_raw','char_repeat','shortest_word_host','shortest_word_path','longest_words_raw','longest_word_host','avg_words_raw','avg_word_host','domain_in_brand','brand_in_subdomain','brand_in_path','nb_hyperlinks','ratio_int_hyperlinks','ratio_ext_hyperlinks','nb_ext_css','ratio_int_redirection','ratio_int_errors','login_form','sfh','iframe','safe_anchor','mx_records','soa_records','txt_records','lon','page_index','page_rank']
    final_features=pd.DataFrame(final_features)
    prediction= model.predict(final_features)
    print(prediction[0])
    if(prediction[0] == 1):
        return 'Phishing'
    else:
        return 'Legitimate'


if __name__ == '__main__':
	app.run(host='0.0.0.0', port=443)