Date.prototype.addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
};

new Vue({
    el: "#main",
    data: {
        date: new Date(),
        zekr: [
            'یا ذالجلال والاکرام', // Sunday
            'یا قاضی الحاجات', // Monday
            ' یا ارحم الراحمین', // Tuesday
            'یا حی یا قیوم', // Wednesday
            'لا اله الا الله الملک الحق المبین', // Thursday
            'اللهم صل علی محمد و ال محمد', // Friday
            'یا رب العالمین' // Saturday
        ],
        occasion: '',
        islamic_add: 0,
        date_add: 0,
        holidayClass: '',
    },
    mounted() {
        let i_a = localStorage.getItem('islamic_add');
        if (i_a) {
            this.islamic_add = parseInt(i_a);
        }

        this.getOccasion();
    },
    computed: {
        gregorian() {
            let date = this.date.addDays(this.date_add);
            let locales = 'default';

            return {
                year: date.toLocaleString(locales, {year: 'numeric'}),
                month: date.toLocaleString(locales, {month: 'short'}).toLowerCase(),
                monthNum: date.toLocaleString(locales, {month: 'numeric'}),
                day: date.toLocaleString(locales, {day: 'numeric'}),
            }
        },
        jalali() {
            let date = this.date.addDays(this.date_add);
            let locales = 'fa-u-ca-persian-nu-latn';

            return {
                year: date.toLocaleString(locales, {year: 'numeric'}),
                month: date.toLocaleString(locales, {month: 'short'}),
                monthNum: date.toLocaleString(locales, {month: 'numeric'}),
                day: date.toLocaleString(locales, {day: 'numeric'}),
                weekDay: date.toLocaleString(locales, {weekday: 'long'}),
            }
        },
        islamic() {
            let date = this.date.addDays(this.islamic_add + this.date_add);
            let locales = 'fa-u-ca-islamic-civil-nu-latn';

            return {
                year: parseInt(date.toLocaleString(locales, {year: 'numeric'})),
                month: date.toLocaleString(locales, {month: 'short'}),
                monthNum: date.toLocaleString(locales, {month: 'numeric'}),
                day: date.toLocaleString(locales, {day: 'numeric'}),
            };
        },
        weekDay() {
            return this.date
                .addDays(this.date_add)
                .getDay()
        },
        owghat() {
            let coordinates = new adhan.Coordinates(35.75, 51.325);

            let params = adhan.CalculationMethod.Other();
            params.fajrAngle = 17.7;
            params.ishaAngle = 4.3;

            let date = this.date
                .addDays(this.date_add);

            let prayerTimes = new adhan.PrayerTimes(coordinates, date, params);

            let locales = 'default';
            let opt = {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            };

            return {
                fajr: prayerTimes.fajr.toLocaleString(locales, opt),
                sunrise: prayerTimes.sunrise.toLocaleString(locales, opt),
                dhuhr: prayerTimes.dhuhr.toLocaleString(locales, opt),
                isha: prayerTimes.isha.toLocaleString(locales, opt),
            };
        }
    },
    methods: {
        addIslamic(days) {
            this.islamic_add += days;
            localStorage.setItem('islamic_add', this.islamic_add);
            this.getOccasion();
        },
        addDate(days) {
            this.date_add += days;
            this.getOccasion();
        },
        makeHoliday() {
            this.holidayClass = this.holidayClass === ''
                ? 'red'
                : '';
        },
        getOccasion() {
            this.occasion = '';
            this.holidayClass = this.weekDay == 5
                ? 'red'
                : '';

            let api = 'https://farsicalendar.com/api/';
            let opt = {
                type: [
                    'sh',
                    'ic',
                    'wc'
                ],
                month: [
                    this.jalali.monthNum,
                    this.islamic.monthNum,
                    this.gregorian.monthNum
                ],
                day: [
                    this.jalali.day,
                    this.islamic.day,
                    this.gregorian.day
                ]
            };

            let url = api
                + [
                    opt.type.join(','),
                    opt.day.join(','),
                    opt.month.join(',')
                ].join('/');

            fetch(url)
                .then(res => res.json())
                .then(res => {
                    if (res.type === 'success' && res.values.length) {
                        res.values.forEach(value => {
                            this.occasion += value.occasion;

                            if (value.year && ['SH', 'IC'].includes(value.type)) {
                                this.occasion += ' (' + value.year + ' ';
                                this.occasion += value.type === 'SH'
                                    ? 'هـ .ش'
                                    : 'هـ .ق';
                                this.occasion += ')';
                            }

                            this.occasion += '\r\n';

                            if (value.dayoff) {
                                this.holidayClass = 'red'
                            }
                        })
                    }
                });
        },
        screenShot() {
            const container = document.querySelector('#container');
            const screenShot = document.querySelector('#screen-shot');
            const screenShotImg = screenShot.querySelector('img');
            const options = {
                scrollX: 0,
                scrollY: 0,
            };

            document.querySelector('.note').contentEditable = 'false';
            window.scroll(0, 0)

            html2canvas(container, options).then(function (canvas) {
                container.style.display = "none";
                // screenShot.appendChild(canvas);
                screenShotImg.src = canvas.toDataURL()
                screenShot.style.display = 'block';
            });
        }
    }
});