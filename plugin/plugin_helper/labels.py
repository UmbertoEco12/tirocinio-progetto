import json
import sys
current_name = 0

class LabelGroup :
    def __init__(self) -> None:
        global current_name
        self.labels = []
        self.name = current_name
        current_name = current_name + 1
        pass
    
    def add_label(self, label : str) :
        self.labels.append(label)
        return self

    def get_labels(self) -> list :
        return {
            "labels": {
                'type': 'text',
                'data':self.labels,},
            "name": self.name
        }

class NumberValueType:
    INT = 1
    FLOAT = 2
class NumberLabelGroup :
    def __init__(self, min: float = sys.float_info.min, max:float = sys.float_info.max, 
                 value_type : NumberValueType = NumberValueType.FLOAT) -> None:
        global current_name
        self.labels = []
        self.name = current_name
        self.min = min
        self.max = max
        current_name = current_name + 1
        self.value_type = value_type
        pass
    
    def set_min(self, min : float) :
        self.min = min
        return self
    def set_max(self, max : float) :
        self.max = max
        return self
    

    def set_value_type(self, value_type : NumberValueType) :
        self.value_type = value_type
        return self
    def value_type_to_js(self):
        if self.value_type == NumberValueType.INT:
            return "1"
        else:
            return "0.01"

    def get_labels(self) -> list :
        
        return {
            "labels": {
                'type' : 'number',
                'min' : self.min,
                'max' : self.max,
                'step' : self.value_type_to_js()
            },
            "name": self.name
        }
    
class ImageLabelGroup :
    def __init__(self, image_id : str) -> None:
        global current_name
        self.labels = []
        self.name = current_name
        self.image_id = image_id
        current_name = current_name + 1
        pass

    def get_labels(self) -> list :
        
        return {
            "labels": {
                'type' : 'image',
                'imgId' :self.image_id
            },
            "name": self.name
        }

class TimestampLabelGroup:
    def __init__(self, media_id : str) -> None:
        global current_name
        self.labels = []
        self.name = current_name
        self.media_id = media_id
        current_name = current_name + 1
        pass

    def get_labels(self) -> list :
        
        return {
            "labels": {
                'type' : 'timestamp',
                'mediaId' :self.media_id
            },
            "name": self.name
        }