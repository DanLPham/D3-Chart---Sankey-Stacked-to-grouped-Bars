import datetime
import random

def date_to_epoch_unix (year, month, day):
    timestamp = datetime.datetime(year, month, day).strftime('%s%f')[:-3]
    return int(timestamp)

def generate_daily_view (startDate, endDate):
    days = (endDate - startDate).days + 1
    dailyView = []
    for x in range(days):
        dailyView.append(random.randint(1000, 9999999))
    return dailyView

def daterange(start_date, end_date):
        for n in range(int((end_date - start_date).days)):
            yield start_date + datetime.timedelta(n)

def generate_daily_contributing_view ():
    f.write("\t\t\t\t{\n")
    write_to_file(5, "date", date_to_epoch_unix(2022, 5, 25), True)
    write_to_file(5, "view", random.randint(0, 999999), False)
    f.write("\n\t\t\t\t}")

    start_date = datetime.date(2022, 5, 26)
    end_date = datetime.date(2022, 6, 30)
    for single_date in daterange(start_date, end_date):
        f.write(",\n\t\t\t\t{\n")
        write_to_file(5, "date", date_to_epoch_unix(single_date.year, single_date.month, single_date.day), True)
        write_to_file(5, "view", random.randint(0, 999999), False)
        f.write("\n\t\t\t\t}")

def write_to_file (level, attr_name, attr_value, is_first):
    if not is_first:
        f.write(",\n")
    for x in range(level):
        f.write("\t")
    f.write("\"" + attr_name + "\": ")
    if type(attr_value) == int:
        f.write(str(attr_value))
    else:
        f.write("\"" + attr_value + "\"")

def write_array_to_file (level, attr_name, attr_arr_value, is_first):
    if not is_first:
        f.write(",\n")
    for x in range(level):
        f.write("\t")
    f.write("\"" + attr_name + "\": [\n")
    for i in range(len(attr_arr_value)):
        for x in range(level+1):
            f.write("\t")
        if type(attr_arr_value[i]) == int:
            f.write(str(attr_arr_value[i]))
        else:
            f.write("\"" + attr_arr_value[i] + "\"")
        if i < len(attr_arr_value) - 1:
            f.write(",")
        f.write("\n")
    for x in range(level):
        f.write("\t")
    f.write("]")

f = open("src/Components/Sankey/Data/demodata.json", "w")
f.write("{\n")

write_to_file(1, "id", "2", True)
write_to_file(1, "title", "Story 2", False)
write_to_file(1, "author", "CSDAP", False)
write_to_file(1, "totalView", 1422574920, False)
write_array_to_file(1, "keywords", ["Keyword 1", "Keyword 2", "Keyword 3"], False)
write_to_file(1, "createdAt", date_to_epoch_unix(2022, 5, 25), False) # Need to be fixed

dailyView = generate_daily_view(datetime.datetime(2022, 5, 25), datetime.datetime(2022, 6, 30))
# print(dailyView)
write_array_to_file(1, "dailyView", dailyView, False) # Need to add a proper array

################################## <- NEIGHBORS
f.write(",\n\t\"neighbors\": [\n")

f.write("\t\t{\n")
write_to_file(3, "id", "321", True)
write_to_file(3, "title", "Story 3", False)
write_to_file(3, "author", "ASJBFS", False)
write_to_file(3, "totalView", 214234235, False)
write_array_to_file(3, "keywords", ["Keyword 4", "Keyword 2", "Keyword 7"], False)
write_to_file(3, "createdAt", date_to_epoch_unix(2022, 5, 31), False) # Need to be fixed
write_to_file(3, "influenceScore", random.randint(1000, 99999), False)

f.write(",\n\t\t\t\"dailyContributingView\": [\n")

generate_daily_contributing_view()

f.write("\n\t\t\t]")
f.write("\n\t\t}")

f.write(",\n\t\t{\n")
write_to_file(3, "id", "12", True)
write_to_file(3, "title", "Story 8768sac", False)
write_to_file(3, "author", "SCASCD", False)
write_to_file(3, "totalView", 2984369, False)
write_array_to_file(3, "keywords", ["Keyword 1", "Keyword 3", "Keyword 9"], False)
write_to_file(3, "createdAt", date_to_epoch_unix(2022, 6, 6), False) # Need to be fixed
write_to_file(3, "influenceScore", random.randint(1000, 99999), False)

f.write(",\n\t\t\t\"dailyContributingView\": [\n")

generate_daily_contributing_view()

f.write("\n\t\t\t]")
f.write("\n\t\t}")

f.write(",\n\t\t{\n")
write_to_file(3, "id", "3974", True)
write_to_file(3, "title", "Story 3255", False)
write_to_file(3, "author", "AHCRJBG", False)
write_to_file(3, "totalView", 7533523532, False)
write_array_to_file(3, "keywords", ["Keyword 2", "Keyword 8", "Keyword 6"], False)
write_to_file(3, "createdAt", date_to_epoch_unix(2022, 4, 17), False) # Need to be fixed
write_to_file(3, "influenceScore", random.randint(1000, 99999), False)

f.write(",\n\t\t\t\"dailyContributingView\": [\n")

generate_daily_contributing_view()

f.write("\n\t\t\t]")
f.write("\n\t\t}")

f.write("\n\t]")
################################## ->

f.write("\n}")
f.close()