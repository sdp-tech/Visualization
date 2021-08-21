import re
from functools import reduce
# Investment Size	Project Banks	Delayed Extent	Updated Date	FC Year	FC Year 증거	Status	Affected Stage	Type of PPP	URLs	Resumed	Resume URL	위치 기준	Latitude	Longitude		Under Construction	U.C URL	Delayed	Delayed URL	Cancelled	Cancelled URL	Operation	Operation URL

# SDP_FAILURE MAP point class
class PpiProject(object):
    def __init__(self, country, project_name_wb, project_name_common, sector, subsector, electricity,
                 segment, crossborder, reason_for_delay, 
                 investment, project_bank, delayed_extent, fc_year, fc_year_reason, ppi_status,
                 affected_stage, type_of_ppp, 
                 urls, resumed, resume_url, longitude, location, latitude, category_of_reason, covid_19):
        

        def _dict_helper(properties): 
            res = dict()
            for key, value in properties :
                key = key.replace('_', ' ')
                res[key] = value

            return res

        if (re.match('^[0-9.|\-]*$', str(longitude)) and (re.match('^[0-9.|\-]*$', str(latitude)))):
            self.type = "Feature"
            self.geometry = {
                                "type": "Point",
                                "coordinates": [float(longitude), float(latitude)]
                            }
            self.properties = {
                "country": PpiProject.parse_country(country),
                "project_name_wb": project_name_wb,
                "project_name_common": project_name_common,
                "project_name" : PpiProject.set_project_name(project_name_wb, project_name_common),
                "sector": sector,
                "subsector": subsector,
                "electricity": electricity,
                "segment": segment,
                "crossborder": crossborder,
                "reason_for_delay": PpiProject.capitalize(reason_for_delay),
                "investment": investment,
                "project_bank": project_bank,
                "delayed_extent": delayed_extent,
                "fc_year": fc_year,
                "fc_year_reason": fc_year_reason,
                "ppi_status": ppi_status,
                "affected_stage": affected_stage,
                "type_of_ppp" : type_of_ppp,
                "urls": PpiProject.parse_urls(urls),
                "resumed": resumed,
                "resume_url": resume_url,
                "location": location,
                "category_of_reason" : category_of_reason,
                "see_also" : '',
                'covid_19' : covid_19
            } 

            # set all emtpy string to null and N/A to null
            for key, value in self.properties.items():
                if type(value) == str and (not value or value.upper() == "N/A") :
                    self.properties[key] = None

            if self.properties['category_of_reason'] is not None :
                self.properties['category_of_reason'] = self.properties['category_of_reason'].split(',')
            
            if self.properties['covid_19'] is not None :
                self.properties['covid_19'] = self.properties['covid_19'].split(',')

            self.properties = _dict_helper(self.properties)

        else:
            self.delete = True

    @staticmethod
    def capitalize(string) :
        if type(string) == str :
            return string[0].upper() + string[1:]

    @staticmethod
    # use first matched url only
    def parse_urls(urls) :
        if type(urls) == str :
            # consider both case - http | https
            indices = [http.start() for http in re.finditer('http', urls)]
            if len(indices) > 1 :
                urls= urls[0:indices[1]]
            return urls 

    # 나라 split 할 때, ",~. Rep'. 경우 고려,
    @staticmethod 
    def merge_REP_case(acc, cur) : 
        # Rep 인 경우, 앞 국가에 붙여서 저장
        if cur.find("Rep.") != -1 :  
            acc[len(acc)-1] += cur
        # 아닌 경우, 공백 제거 후 저장
        else :
            acc.append(cur.strip())
        return acc

    @staticmethod
    def parse_country(country) : 
        country_list = country.split(',')
        return reduce(PpiProject.merge_REP_case, country_list, [])

    @staticmethod 
    def set_project_name(project_name_wb, project_name_common) :
        if project_name_wb != 'N/A' :
            return project_name_wb
        return project_name_common          